from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import vertexai
import os
from datetime import datetime
from google.oauth2 import service_account
from vertexai.generative_models import GenerativeModel
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
import logging
from Translate_Terms import translate_text

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
gemini_model = GenerativeModel("gemini-2.5-flash-lite")
embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# ChromaDB 벡터 저장소 경로
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VECTOR_DB_MAP = {
    '대출': os.path.join(BASE_DIR, '대출'),
    '주택담보대출': os.path.join(BASE_DIR, '대출'),
    '암보험': os.path.join(BASE_DIR, '암보험'),
    '예금': os.path.join(BASE_DIR, '예금'),
    '자동차보험': os.path.join(BASE_DIR, '자동차보험'),
    '적금': os.path.join(BASE_DIR, '적금')
}

# 프롬프트 템플릿
PROMPT_TEMPLATE = """...""" # 프롬프트 내용은 생략

# 약관 생성 API 엔드포인트
@app.route('/api/generate', methods=['POST', 'OPTIONS'])
@cross_origin(origin='*')
def generate_terms():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "요청 데이터가 없습니다."}),
 
        company_name = data.get('companyName')
        category = data.get('category')
        product_name = data.get('productName')
        wishlist = data.get('requirements')
 
        if not all([company_name, category, product_name, wishlist]):
            return jsonify({"error": "필수 입력값이 누락되었습니다."}),
        
        if category == '주택담보대출':
            category = '대출'

        persist_dir = VECTOR_DB_MAP.get(category)
        if not persist_dir or not os.path.isdir(persist_dir):
            return jsonify({"error": f"{category}에 해당하는 벡터 저장소 폴더가 없습니다."}),
        
        vectorstore = Chroma(
            persist_directory=persist_dir, 
            embedding_function=embedding
        )
        
        retriever = vectorstore.as_retriever(search_kwargs={'k': 5})
        docs = retriever.invoke(wishlist)

        context = "\n\n".join([doc.page_content for doc in docs])
        current_date = datetime.now().strftime("%Y년 %m월 %d일")

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
        return jsonify({"error": str(e)}),

# 번역 API 엔드포인트
@app.route('/api/translate', methods=['POST', 'OPTIONS'])
@cross_origin(origin='*')
def translate_terms_api():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "요청 데이터가 없습니다."}),

        text_to_translate = data.get('text')
        target_language = data.get('target_language')

        if not all([text_to_translate, target_language]):
            return jsonify({"error": "필수 입력값이 누락되었습니다."}),

        translated_text = translate_text(text_to_translate, target_language)

        return jsonify({"translated_text": translated_text})

    except Exception as e:
        logging.exception("번역 중 오류")
        return jsonify({"error": str(e)}),

# 로컬 실행
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
