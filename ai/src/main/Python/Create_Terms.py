from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import vertexai
import os
from datetime import datetime
from google.oauth2 import service_account
from vertexai.generative_models import GenerativeModel  # ✅ 변경
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
import logging
 
# Flask App 초기화 및 CORS 설정
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
 
# 로그 설정
logging.basicConfig(level=logging.INFO)
 
# Vertex AI 설정
PROJECT_ID = "aivle-team0721"
LOCATION = "us-central1"
SERVICE_ACCOUNT_FILE = "/app/src/main/Python/aivle-team0721-79f3f908cb54.json"
 
# Vertex 인증
credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE)
vertexai.init(project=PROJECT_ID, location=LOCATION, credentials=credentials)
 
# LLM 및 임베딩 모델 초기화
gemini_model = GenerativeModel("gemini-2.0-flash")
embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# ChromaDB 벡터 저장소 경로
# BASE_DIR를 사용하여 동적으로 경로를 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VECTOR_DB_MAP = {
    '대출': os.path.join(BASE_DIR, '대출'),
    # ✅ 수정: 주택담보대출 카테고리가 대출 폴더를 참조하도록 추가
    '주택담보대출': os.path.join(BASE_DIR, '대출'),
    '암보험': os.path.join(BASE_DIR, '암보험'),
    '예금': os.path.join(BASE_DIR, '예금'),
    '자동차보험': os.path.join(BASE_DIR, '자동차보험'),
    '적금': os.path.join(BASE_DIR, '적금')
}

# 프롬프트 템플릿
PROMPT_TEMPLATE = """
기업 이름은 다음과 같아:
{company_name}

상품 이름은 다음과 같아:
{product_name}

다음은 기업이 제공한 상품 정보야:
{wishlist}

다음은 해당 약관/계약의 시행 날짜야:
{date}

그리고 아래는 참고용 약관 문서야:
{context}

위의 상품 정보와 약관 문서를 참고해서 이 상품에 맞는 보험 약관 초안을 자세하게 작성해줘.
기업에서 바로 약관으로 사용할 수 있을 정도로 자세하게 작성해주고, 독소조항과 소비자의 악용이 우려되는 내용은 특히 신경써줘.
참고하라고 준 약관 이외에도 네가 이미 알고있는 약관을 참고해서 작성해도 돼. 최대한 자세하게 작성하는게 네 역할이야.
작성한 약관 초안 앞뒤로 아무 코멘트 달지 말고, **과 같은 마크업은 절대 사용하지마. 그냥 약관 내용에 '*' 기호를 하나도 넣지 마.
최소 50 조항 이상 작성해줘. 그리고 조항에 따른 하위 조항도 여러개 추가해주고, 그것에 대한 설명도 자세히 해줘.
조항을 번호를 표기할 때 예시로는 제1조, 제2조, 1., 2. 이런식으로 제n조와 n.으로만 표기해줘.
조항을 작성할 때 메인이 되는 부분은 보장 관련된 내용이여야 해. 보장 관련 금액과 보장이 안 되는 부분 등 상세히 작성해줘.
약관 초안의 전체 길이를 최대한 길게 작성해줘.
작성할 때 '일정 금액', '일정 기간'과 같은 추상적인 표현은 사용하지 말고, 구체적인 숫자, 기간, 기준 또는 참조 가능한 공시 위치를 명시해줘.
중요한 책임 및 면책조항에서 법률 용어를 사용하되, 고객이 이해하기 쉽도록 풀어서 작성하거나, 예시를 추가해줘.
이 외에도 중요한 조항에는 구체적인 절차나 방법을 명시하고, 애매할 수 있는 표현이 없도록 구체적인 조건을 제시해줘.
약관을 보는 고객이 오해할 만한 내용을 없애고 모든 내용을 구체적으로 명시해야해.
예시를 들자면 '소정의 이자'라는 내용이 약관 내용에 들어간다면, '여기서 '소정의 이자'라 함은 약정 이자율과 예금보험공사가 정하는 이자율 중 낮은 이자율을 말합니다.'와 같은 구체적인 명시적 설명이 있어야해.
그리고 '중과실', '부당하다고 판단 되는 경우'와 같이 여러 해석이 가능한 내용은 구체적인 예시를 드는 등 부가설명을 해줘.
약관의 목적이 상품 정보 전달 뿐만 아니라, 고객과의 오해 소지를 최소화하고, 기업의 내부 정책 및 절차를 더욱 명확히 하여 분쟁 발생 시 기업의 입장을 더욱 공고히 하려는 목적도 있음을 명심하고 작성해.
반복되는 문구, 예를 들어서 '중과실' 같은 내용이 여러 조항에서 반복된다면, 매번 설명하지 말고 용어를 정의하는 조항에 작성해서 간결하게 작성해줘.
가능하다면 절차를 진행할 방법을 하나만 두지 말고, 메인으로 진행하는 방법 하나와 해당 방법을 사용할 수 없을 때를 위한 예비 방법을 추가로 기재해줘.
마지막으로 출력하기 전에 한 번 읽어보고 미흡한 점이나 독소조항, 리스크 등 수정할 부분을 확인하고 수정할 부분이 있다면 수정해서 출력해줘.
"""

# CORS Header 강제 삽입
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


# API 엔드포인트
@app.route('/api/generate', methods=['POST', 'OPTIONS'])
@cross_origin(origin='*')
def generate_terms():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "요청 데이터가 없습니다."}), 400

        company_name = data.get('companyName')
        category = data.get('category')
        product_name = data.get('productName')
        wishlist = data.get('requirements')

        if not all([company_name, category, product_name, wishlist]):
            return jsonify({"error": "필수 입력값이 누락되었습니다."}), 400
        
        # ✅ '주택담보대출'을 '대출'로 매핑하는 로직 추가
        if category == '주택담보대출':
            category = '대출'

        persist_dir = VECTOR_DB_MAP.get(category)
        if not persist_dir or not os.path.isdir(persist_dir):
            return jsonify({"error": f"{category}에 해당하는 벡터 저장소 폴더가 없습니다."}), 400
        
        # ChromaDB에서 임베딩 모델과 함께 기존 벡터 저장소 로드
        vectorstore = Chroma(
            persist_directory=persist_dir, 
            embedding_function=embedding
        )
        
        # 유사성 검색(retriever)
        retriever = vectorstore.as_retriever(search_kwargs={'k': 5})
        docs = retriever.invoke(wishlist)

        context = "\n\n".join([doc.page_content for doc in docs])
        current_date = datetime.now().strftime("%Y년 %m월 %d일")

        # Gemini 호출
        prompt = PROMPT_TEMPLATE.format(
            context=context,
            company_name=company_name,
            product_name=product_name,
            wishlist=wishlist,
            date=current_date
        )
        response = gemini_model.generate_content(prompt)

        return jsonify({"terms": response.candidates[0].content.parts[0].text})

    except Exception as e:
        logging.exception("약관 생성 중 오류")
        return jsonify({"error": str(e)}), 500

# 로컬 실행
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)