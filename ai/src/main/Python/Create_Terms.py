from flask import Flask, request, jsonify
from flask_cors import CORS
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

# CORS 설정: 프론트엔드 요청 허용
CORS(app, resources={r"/api/*": {"origins": "http://34.54.82.32"}})

logging.basicConfig(level=logging.INFO)

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
참고하라고 준 약관 이외에도 네가 이미 알고있는 약관을 참고해도 돼. 최대한 자세하게 작성하는게 네 역할이야.
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

@app.after_request
def apply_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://34.54.82.32"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

@app.route("/api/generate", methods=["OPTIONS"])
def handle_options():
    return '', 204

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
