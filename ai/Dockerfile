FROM python:3.9-slim

# 기본 패키지 설치
RUN apt-get update && apt-get install -y \
    build-essential \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# requirements 설치
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 소스 코드 복사
COPY app/ .

# 포트 오픈
EXPOSE 8080

# 실행 명령
CMD ["gunicorn", "-b", "0.0.0.0:8080", "Create_Terms:app", "--workers=1", "--threads=4"]
