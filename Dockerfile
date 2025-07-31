# Python 공식 이미지 기반
FROM python:3.9-slim
# SQLite 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    sqlite3 \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# requirements 설치
COPY ai/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt && \
    pip install --no-cache-dir --upgrade \
        google-auth \
        google-cloud-aiplatform \
        langchain-google-vertexai

# 애플리케이션 소스 복사
COPY ai/src/main/Python/ /app/src/main/Python/
COPY point/ /app/point/
COPY term/ /app/term/
COPY user/ /app/user/

# ✅ 서비스 계정 키 복사
COPY ai/src/main/Python/aivle-team0721-c72ab84f2251.json /app/src/main/Python/aivle-team0721-c72ab84f2251.json

# ✅ 환경변수 설정
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/src/main/Python/aivle-team0721-c72ab84f2251.json
ENV GOOGLE_CLOUD_PROJECT=aivle-team0721
ENV PYTHONPATH=/app

# ✅ 빌드 시 키파일 존재 여부 체크
RUN test -f /app/src/main/Python/aivle-team0721-c72ab84f2251.json

# Gunicorn 서버 실행
CMD ["gunicorn", "--bind", ":8080", "--workers", "1", "--threads", "8", "src.main.Python.Create_Terms:app"]
