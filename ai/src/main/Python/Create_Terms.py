from flask import Flask, request, jsonify
from flask_cors import CORS
import vertexai
import os
from datetime import datetime
from langchain_google_vertexai import ChatVertexAI
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
import logging

app = Flask(__name__)

# ✅ CORS 허용
CORS(app, resources={r"/api/*": {"origins": "*"}})

logging.basicConfig(level=logging.INFO)

# ✅ Vertex AI 프로젝트 강제 초기화
vertexai.init(
    project=os.environ.get("GOOGLE_CLOUD_PROJECT", "aivle-team0721"),
    location="us-central1"
)

location = "us-central1"
llm = ChatVertexAI(model_name="gemini-1.5-flash-001", location=location)
embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CATEGORY_FOLDER_MAP = {
    '예금': os.path.join(BASE_DIR, '예금약관'),
    '적금': os.path.join(BASE_DIR, '적금약관'),
    '주택담보대출': os.path.join(BASE_DIR, '대출약관'),
    '암보험': os.path.join(BASE_DIR, '암보험약관'),
    '자동차보험': os.path.join(BASE_DIR, '자동차보험약관')
}

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
최소 50개 이상의 조항을 작성하고, 제n조 형식으로 번호를 붙이고, 구체적인 금액·기간·조건을 명시해줘.
"""

# ✅ 모든 응답에 CORS 헤더 강제 추가
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# ✅ Preflight 요청 처리
@app.route('/api/generate', methods=['OPTIONS'])
def preflight():
    return '', 204

# ✅ 약관 생성 API
@app.route('/api/generate', methods=['POST'])
def generate_terms():
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

        pdf_dir_path = CATEGORY_FOLDER_MAP.get(category)
        if not pdf_dir_path or not os.path.isdir(pdf_dir_path):
            return jsonify({"error": f"{category}에 해당하는 약관 폴더가 없습니다."}), 400

        loader = PyPDFDirectoryLoader(pdf_dir_path)
        documents = loader.load()
        if not documents:
            return jsonify({"error": f"{category} 약관 PDF를 불러오지 못했습니다."}), 400

        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        docs_chunked = splitter.split_documents(documents)

        vectorstore = Chroma.from_documents(docs_chunked, embedding)
        retriever = vectorstore.as_retriever()

        docs = retriever.invoke("약관 초안 작성에 필요한 정보")
        context = "\n\n".join([doc.page_content for doc in docs])
        current_date = datetime.now().strftime("%Y년 %m월 %d일")

        prompt = PromptTemplate.from_template(PROMPT_TEMPLATE)
        chain = prompt | llm | StrOutputParser()

        response = chain.invoke({
            "context": context,
            "company_name": company_name,
            "product_name": product_name,
            "wishlist": wishlist,
            "date": current_date
        })

        return jsonify({"terms": response})

    except Exception as e:
        logging.exception("약관 생성 중 오류")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
