# -*- coding: utf-8 -*-
"""
NER 마이크로서비스
- 조항 분리
- Gemini NER (text/label만)
- start/end 오프셋 계산
- displacy HTML 생성
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os, re, json, logging, unicodedata

# --- (선택) Vertex AI / Gemini ---
import vertexai
from google.oauth2 import service_account
from google.cloud import secretmanager
from langchain_google_vertexai import ChatVertexAI

# --- spaCy (displacy 시각화) ---
import spacy
from spacy import displacy

# -------------------------
# Flask & CORS
# -------------------------
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
    # preflight/실요청 모두 CORS 허용
    origin = request.headers.get("Origin", "*")
    resp.headers["Access-Control-Allow-Origin"] = origin if origin else "*"
    resp.headers["Vary"] = "Origin"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    resp.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS,PUT,PATCH,DELETE"
    return resp

# 모든 /api/* OPTIONS 를 204로 허용 (preflight)
@app.route("/api/<path:_any>", methods=["OPTIONS"])
def cors_preflight(_any):
    return ("", 204)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

# 라우트 목록 확인용 (디버그)
@app.route("/__routes__", methods=["GET"])
def __routes__():
    return jsonify(sorted([str(r) for r in app.url_map.iter_rules()]))

# -------------------------
# Gemini 초기화 (Secret Manager → 파일 fallback)
# -------------------------
PROJECT_ID = os.getenv("GCP_PROJECT", "aivle-team0721")
LOCATION   = os.getenv("GCP_LOCATION", "us-central1")
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
LOCAL_KEY_FILE = os.environ.get(
    "GOOGLE_APPLICATION_CREDENTIALS",
    os.path.join(BASE_DIR, "the-method-467402-k4-3b6511ed1f9e.json"),
)

credentials = None
try:
    sm = secretmanager.SecretManagerServiceClient()
    # 필요한 Secret 이름에 맞게 수정 가능
    secret_name = f"projects/{PROJECT_ID}/secrets/firebase-adminsdk/versions/latest"
    payload = sm.access_secret_version(name=secret_name).payload.data.decode("utf-8")
    credentials = service_account.Credentials.from_service_account_info(json.loads(payload))
    logging.info("Secret Manager 자격증명 로드 성공")
except Exception as e:
    logging.warning(f"Secret Manager 실패: {e} / 로컬 키 사용 시도")
    if os.path.exists(LOCAL_KEY_FILE):
        credentials = service_account.Credentials.from_service_account_file(LOCAL_KEY_FILE)
        logging.info("로컬 서비스 계정 키 로드 성공")
    else:
        logging.error("자격증명 없음. LLM 호출 불가")

gemini = None
if credentials:
    try:
        vertexai.init(project=PROJECT_ID, location=LOCATION, credentials=credentials)
        # 필요 시 model_name 변경 가능
        gemini = ChatVertexAI(model_name="gemini-2.5-flash-lite", location=LOCATION)
        logging.info("Gemini 초기화 성공")
    except Exception as e:
        logging.error(f"Gemini 초기화 실패: {e}")

# -------------------------
# spaCy (시각화용 빈 모델)
# -------------------------
try:
    nlp = spacy.blank("en")
except Exception:
    nlp = spacy.blank("en")

VIS_COLORS = {
    "CLAUSE_ID": "#ffe6e6",
    "CLAUSE_REF": "#e6f0ff",
    "LAW_REF": "#fff2cc",
    "CONDITION": "#ffe6f7",
    "ORGANIZATION": "#f0e6ff",
    "TIME_DURATION": "#fff0e6",
}

# -------------------------
# 조항 분리 (헤더는 반드시 줄 단위)
# -------------------------
HEADER_RE = re.compile(
    r'(?<=\n)\s*(?:\*\*\s*)?(?P<header>제\s*\d+\s*조(?:\s*[（(][^)\n）]*[）)])?)\s*(?:\*\*)?\s*(?=\n)'
)

def split_clauses(raw: str):
    """본문에서 줄 단위 헤더만 조항으로 인식 (본문 인라인 '제n조' 제외)"""
    if not raw:
        return []
    t = raw.replace("\r\n", "\n").replace("\r", "\n")
    if not t.startswith("\n"): t = "\n" + t
    if not t.endswith("\n"):  t = t + "\n"
    m = list(HEADER_RE.finditer(t))
    out = []
    if not m:
        if raw.strip():
            out.append({"clause_id": "전체", "korean": raw.strip()})
        return out
    if m[0].start() > 0:
        pre = t[:m[0].start()].strip()
        if pre:
            out.append({"clause_id": "머리말", "korean": pre})
    for i, mm in enumerate(m):
        cid = mm.group("header").strip()
        start = mm.start()
        end = m[i + 1].start() if i + 1 < len(m) else len(t)
        body = re.sub(r"\*+", "", t[start:end].strip())
        out.append({"clause_id": cid, "korean": body})
    return out

def canon_clause_id(s: str):
    m = re.search(r'제\s*(\d+)\s*조', s or "")
    return f"제{int(m.group(1))}조" if m else None

# -------------------------
# NER 프롬프트 (text/label만)
# -------------------------
NER_PROMPT = """
다음은 보험약관의 한 조항입니다. 이 조항에서 의미 있는 핵심 키워드를 추출하여 엔터티로 변환해 주세요.

다음 형식의 JSON 배열로 출력하세요 (배열 1개, 그 안에 객체 1개 권장):
[
  {{
    "text": "한글 원문 전체 그대로",
    "entities": [
      {{ "text": "키워드1", "label": "LABEL" }},
      ...
    ]
  }}
]

🔒 반드시 다음을 지켜주세요:
- **JSON만** 출력하세요. 마크다운 코드블록(```)이나 설명/주석을 포함하지 마세요.
- 라벨 이름은 **아래 목록과 철자 동일**해야 합니다. 다른 라벨을 만들지 마세요.
- **CLAUSE_ID는 반드시 1개**만 추출하며, **헤더(첫 줄)의 조항 번호**만 text로 추출합니다.
  - 예) "제3조 (보장개시일)" → CLAUSE_ID.text = "제3조"
- **CLAUSE_REF는 본문에서만** 다른 조항을 참조할 때 추출합니다. 헤더의 "제n조"는 CLAUSE_REF로 만들지 마세요.
  - 예) "제5조에 따라", "제10조 및 제11조를 준용" → 각각 "제5조", "제10조", "제11조"로 분리하여 개별 엔티티를 생성
  - 자기 자신(해당 조항 번호)을 참조한 경우는 제외
- "의료법 제3조" 등 **법령 + 조문 표현은 LAW_REF**이며, CLAUSE_REF가 아닙니다.
- 동일 텍스트가 여러 번 있더라도 **겹치지 않게** 대표적으로만 추출하세요.

Allowed labels:

- **CLAUSE_ID**
  : 헤더(첫 줄)의 조항 번호만 추출 (예: "제3조")

- **CLAUSE_REF**
  : 본문에서 다른 조항을 참조하는 문구의 조항 번호만 추출 (예: "제5조", "제10조")

- **LAW_REF**
  : 법령 이름(+조문)을 추출 (예: "상법 제103조", "개인정보보호법 제36조", "의료법")

- **CONDITION**
  : 어떤 조치를 위한 조건/상황 설명 (예: "보험료를 미납한 경우", "계약자가 청약을 철회한 때")

- **ORGANIZATION**
  : 계약 당사자/기관/주체 (예: "예금보험공사", "회사", "계약자", "피보험자", "의료기관")

- **TIME_DURATION**
  : 기간/날짜/시한 (예: "3년간", "계약일로부터 90일", "3영업일", "2025.04.03", "월요일까지")

---

한글 조항:
{clause_korean}
"""

def _extract_json_array(text: str) -> list:
    """응답에서 JSON 배열만 안전하게 추출"""
    c = (text or "").strip()
    if "```json" in c:
        c = c.split("```json", 1)[1].split("```", 1)[0]
    l = c.find("["); r = c.rfind("]")
    if l == -1 or r == -1 or r < l:
        raise ValueError("JSON 배열을 찾지 못함")
    return json.loads(c[l:r+1])

def call_gemini_entities(clause_text: str):
    if not gemini:
        raise RuntimeError("Gemini가 초기화되지 않았습니다.")
    prompt = NER_PROMPT.format(clause=clause_text)
    resp = gemini.invoke(prompt)
    arr = _extract_json_array(resp.content or "")
    # 결과 정규화 (첫 객체 사용)
    if isinstance(arr, dict):
        arr = [arr]
    first = arr[0] if arr else {"entities": []}
    ents = [{"text": e.get("text",""), "label": e.get("label","")} for e in first.get("entities", [])]
    return {"text": clause_text, "entities": ents}

# -------------------------
# 오프셋 계산
# -------------------------
def nfc(s): return unicodedata.normalize("NFC", s or "")

def canon_clause_pat_from_text(s: str):
    m = re.search(r'제\s*(\d+)\s*조', s or "")
    return re.compile(rf'제\s*{int(m.group(1))}\s*조') if m else None

def make_flex_regex(s: str):
    parts = re.split(r"\s+", (s or "").strip())
    return re.compile(r"\s*".join(map(re.escape, parts)))

def find_offsets(text: str, ent_text: str, label: str):
    text, ent_text = nfc(text), nfc(ent_text)
    spans = [(m.start(), m.end()) for m in re.finditer(re.escape(ent_text), text)]
    if spans: return spans
    if label in ("CLAUSE_ID", "CLAUSE_REF"):
        p = canon_clause_pat_from_text(ent_text)
        if p:
            for m in p.finditer(text): spans.append((m.start(), m.end()))
            if spans: return sorted(set(spans))
    for m in make_flex_regex(ent_text).finditer(text):
        spans.append((m.start(), m.end()))
    return sorted(set(spans))

POLICY = {
    "CLAUSE_ID": "first_only",
    "CLAUSE_REF": "keep_all",
    "ORGANIZATION": "first_only",
    "LAW_REF": "first_only",
    "TIME_DURATION": "first_only",
    "CONDITION": "first_only",
}

def apply_policy(spans, label):
    if not spans: return []
    mode = POLICY.get(label, "first_only")
    if mode == "keep_all":
        spans = sorted(spans)
        out, last = [], -1
        for s, e in spans:
            if s >= last:
                out.append((s, e))
                last = e
        return out
    return [sorted(spans)[0]]

# -------------------------
# displacy HTML
# -------------------------
def to_displacy_html(items):
    options = {"colors": VIS_COLORS}
    blocks = []
    for it in items:
        text = it.get("text", "")
        ents = it.get("entities", [])
        doc = nlp.make_doc(text)
        spans = []
        for e in ents:
            span = doc.char_span(e["start"], e["end"], label=e["label"], alignment_mode="contract")
            if span is not None:
                spans.append(span)
        doc.ents = spacy.util.filter_spans(spans)
        html = displacy.render(doc, style="ent", options=options)
        header = text.splitlines()[0].strip()
        blocks.append(
            f"<hr style='margin:24px 0;border:1px solid #ddd'>"
            f"<h3 style='margin:0 0 8px 0'>{header}</h3>{html}"
        )
    return "<html><head><meta charset='utf-8'></head><body>" + "\n".join(blocks) + "</body></html>"

# -------------------------
# Routes
# -------------------------
@app.route("/api/clauses/split", methods=["POST", "OPTIONS"])
def api_split():
    if request.method == "OPTIONS":
        return ("", 204)
    data = request.get_json(force=True, silent=True) or {}
    text = data.get("text", "")
    return jsonify({"clauses": split_clauses(text)})

@app.route("/api/ner", methods=["POST", "OPTIONS"])
def api_ner():
    if request.method == "OPTIONS":
        return ("", 204)
    data = request.get_json(force=True, silent=True) or {}
    text = data.get("text", "")
    clauses = split_clauses(text)
    out = []
    for c in clauses:
        out.append(call_gemini_entities(c["korean"]))
    return jsonify({"items": out})

@app.route("/api/ner/offsets", methods=["POST", "OPTIONS"])
def api_offsets():
    if request.method == "OPTIONS":
        return ("", 204)
    """
    입력: { "items": [ { "text": "...", "entities": [ {"text": "...", "label": "..."} ] } ] }
    출력: { "items": [ { "text": "...", "entities": [ {"text": "...", "label": "...", "start": 0, "end": 3} ] } ] }
    """
    data = request.get_json(force=True, silent=True) or {}
    items = data.get("items", [])
    out = []
    for it in items:
        text = it.get("text","")
        ents = []
        seen = set()
        for e in it.get("entities", []):
            et, lb = e.get("text",""), e.get("label","")
            if not et or not lb: continue
            spans = apply_policy(find_offsets(text, et, lb), lb)
            for s, epos in spans:
                k = (lb, s, epos)
                if k in seen: continue
                seen.add(k)
                ents.append({"text": text[s:epos], "label": lb, "start": s, "end": epos})
        out.append({"text": text, "entities": ents})
    return jsonify({"items": out})

@app.route("/api/visualize", methods=["POST", "OPTIONS"])
def api_visualize():
    if request.method == "OPTIONS":
        return ("", 204)
    """
    입력: { "text": "약관 전체" }
    출력: { "html": "<displacy ...>", "items": [...] }
    """
    if not gemini:
        return jsonify({"error": "Gemini가 초기화되지 않았습니다."}), 500
    data = request.get_json(force=True, silent=True) or {}
    raw_text = data.get("text", "")

    # 1) 분리 → 2) NER → 3) offsets → 4) displacy
    clauses = split_clauses(raw_text)
    items = []
    for c in clauses:
        ner = call_gemini_entities(c["korean"])
        text = ner["text"]
        ents = []
        seen = set()
        for e in ner.get("entities", []):
            spans = apply_policy(find_offsets(text, e["text"], e["label"]), e["label"])
            for s, epos in spans:
                k = (e["label"], s, epos)
                if k in seen: continue
                seen.add(k)
                ents.append({"text": text[s:epos], "label": e["label"], "start": s, "end": epos})
        items.append({"text": text, "entities": ents})

    html = to_displacy_html(items)
    return jsonify({"html": html, "items": items})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8081")), debug=True)
