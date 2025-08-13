# -*- coding: utf-8 -*-
"""
그래프 마이크로서비스
- 조항/NER로 네트워크 JSON/HTML 생성
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os, re, json, logging
from collections import Counter

# (선택) HTML 시각화용
from pyvis.network import Network

app = Flask(__name__)
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=False,
    allow_headers=["Content-Type"],
    methods=["GET", "POST", "OPTIONS"],
)
logging.basicConfig(level=logging.INFO)

@app.after_request
def add_cors_headers(resp):
    origin = request.headers.get("Origin", "*")
    resp.headers["Access-Control-Allow-Origin"] = origin if origin else "*"
    resp.headers["Vary"] = "Origin"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    resp.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS,PUT,PATCH,DELETE"
    return resp

@app.route("/api/<path:_any>", methods=["OPTIONS"])
def cors_preflight(_any):
    return ("", 204)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

@app.route("/__routes__", methods=["GET"])
def __routes__():
    return jsonify(sorted([str(r) for r in app.url_map.iter_rules()]))

# -----------------------------
# 유틸
# -----------------------------
def canon_clause_id(s: str):
    m = re.search(r'제\s*(\d+)\s*조', s or "")
    return f"제{int(m.group(1))}조" if m else None

def to_tooltip_html(text: str, limit: int = 1500) -> str:
    if text is None: return ""
    s = text.strip()
    if len(s) > limit: s = s[:limit] + "…"
    # 이스케이프 + 줄바꿈 유지
    s = s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
    s = s.replace("\r\n","\n").replace("\r","\n").replace("\n","<br>")
    # 프리라인 + 가독성
    return f"<div style='white-space:pre-line;max-width:1100px;line-height:1.5'>{s}</div>"

def scale_size(values, x, smin=12, smax=40):
    if not values:
        return (smin + smax) / 2
    mi, ma = min(values), max(values)
    if ma == mi:
        return (smin + smax) / 2
    return smin + (x - mi) * (smax - smin) / (ma - mi)

# -----------------------------
# 메인 API: /api/graph
# -----------------------------
@app.route("/api/graph", methods=["POST", "OPTIONS"])
def api_graph():
    if request.method == "OPTIONS":
        return ("", 204)
    """
    입력 예:
    {
      "clauses": [ { "clause_id": "제1조 (목적)", "korean": "제1조 (목적)\n..." }, ... ],
      "ner_items": [ { "text": "...", "entities": [ {"text":"제5조","label":"CLAUSE_REF","start":..,"end":..}, ... ] }, ... ],
      "scores": { "제1조": 1.2, "제2조": 0.8, ... },  (선택)
      "arrow": "mentions" | "influences",          (선택, 기본 influences)
      "include_html": true|false                    (선택, 기본 false)
    }
    """
    data = request.get_json(force=True, silent=True) or {}
    clauses = data.get("clauses", [])
    ner_items = data.get("ner_items", [])
    scores = data.get("scores", {})
    arrow = data.get("arrow", "influences")  # "mentions" or "influences"
    include_html = bool(data.get("include_html", False))

    # 조항 맵
    clause_text = {}   # id -> full text
    heading_map = {}   # id -> '제n조 (제목)' (첫 줄)
    for c in clauses:
        header_full = c.get("clause_id","").strip()
        cid = canon_clause_id(header_full) or header_full.split("(")[0].strip()
        text = c.get("korean","")
        clause_text[cid] = text
        # 첫 줄이 제목
        heading_map[cid] = (text.splitlines()[0].strip() if text else header_full or cid)

    # 영향력 점수
    influence_map = {}
    for k, v in scores.items():
        key = canon_clause_id(k) or k.replace(" ","")
        try:
            influence_map[key] = float(v)
        except:
            influence_map[key] = 1.0

    # 엣지 계산: NER의 CLAUSE_REF만 사용
    edge_counts = Counter()
    for item in ner_items:
        # src (해당 아이템의 조항 번호) 추정: 첫 줄의 '제n조'
        src_id = canon_clause_id((item.get("text","").splitlines() or [""])[0])
        if not src_id or src_id not in clause_text:
            continue
        for e in item.get("entities", []):
            if e.get("label") != "CLAUSE_REF":
                continue
            dst_id = canon_clause_id(e.get("text",""))
            if not dst_id or dst_id == src_id:
                continue
            if dst_id in clause_text:
                edge_counts[(src_id, dst_id)] += 1

    # 노드/엣지(JSON)
    cid_list = sorted(clause_text.keys())
    sizes = [influence_map.get(cid, 1.0) for cid in cid_list] or [1.0]

    nodes_json = []
    for cid in cid_list:
        nodes_json.append({
            "id": cid,
            "label": heading_map.get(cid, cid),
            "size": scale_size(sizes, influence_map.get(cid, 1.0)),
            "title": to_tooltip_html(clause_text[cid]),
            "color": "#E8F0FE"
        })

    edges_json = []
    for (src, dst), cnt in edge_counts.items():
        if arrow == "influences":
            # B(참조된) -> A(참조한) : 영향 흐름
            a_from, a_to = dst, src
            etitle = f"{dst} → {src}<br>{cnt}회 영향(참조 근거)"
        else:
            # A -> B : A가 B를 참조함
            a_from, a_to = src, dst
            etitle = f"{src} → {dst}<br>{cnt}회 참조"

        edges_json.append({"from": a_from, "to": a_to, "value": cnt, "title": etitle})

    result = {
        "nodes": nodes_json,
        "edges": edges_json,
        "meta": {
            "node_count": len(nodes_json),
            "edge_count": len(edges_json),
            "arrow": arrow
        }
    }

    # (선택) HTML 생성
    if include_html:
        net = Network(height="800px", width="100%", directed=True, notebook=False, cdn_resources="in_line")
        net.barnes_hut()
        net.set_options(json.dumps({
            "interaction": {"hover": True, "tooltipDelay": 80},
            "edges": {"arrows": {"to": {"enabled": True}}, "smooth": {"type": "dynamic"}},
            "physics": {"stabilization": {"iterations": 150}}
        }))
        for n in nodes_json:
            net.add_node(n["id"], label=n["label"], size=float(n["size"]), title=n["title"], color=n["color"], shape="dot")
        for e in edges_json:
            net.add_edge(e["from"], e["to"], value=float(e["value"]), title=e["title"], arrows="to")
        html = net.generate_html()
        result["html"] = html

    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8082")), debug=True)
