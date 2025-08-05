FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ai/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ai/src/main/Python/ .

# ✅ 서비스 계정 키 파일 복사
COPY ai/src/main/Python/aivle-team0721-79f3f908cb54.json /app/aivle-team0721-79f3f908cb54.json

# ✅ ChromaDB 벡터 저장소 폴더 복사
COPY ai/src/main/Python/대출 /app/대출
COPY ai/src/main/Python/암보험 /app/암보험
COPY ai/src/main/Python/예금 /app/예금
COPY ai/src/main/Python/자동차보험 /app/자동차보험
COPY ai/src/main/Python/적금 /app/적금

EXPOSE 8080

CMD ["gunicorn", "-b", "0.0.0.0:8080", "Create_Terms:app", "--workers=1", "--threads=4"]
