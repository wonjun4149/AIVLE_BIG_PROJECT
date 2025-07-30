# 파이썬 공식 이미지를 기반으로 합니다.
FROM python:3.9-slim-buster

# Cloud Run은 PORT 환경 변수를 통해 요청을 보냅니다. 기본 8080.
ENV PORT 8080

# 작업 디렉토리를 /app으로 설정
WORKDIR /app

# Google Cloud 서비스 계정 키 파일을 컨테이너 내부에 복사
COPY ai/src/main/Python/aivle-team0721-c72ab84f2251.json /app/src/main/Python/aivle-team0721-c72ab84f2251.json

# ai/src/main/Python 디렉토리의 모든 내용을 컨테이너의 /app/src/main/Python으로 복사
# Create-Terms.py 파일명을 Create_Terms.py 로 바꾸어 복사
COPY ai/src/main/Python/ /app/src/main/Python/

# requirements.txt 파일 복사
COPY ai/requirements.txt /app/requirements.txt

# 추가 디렉토리들 복사
COPY point/ /app/point/
COPY term/ /app/term/
COPY user/ /app/user/

# Python 의존성 설치
RUN pip install --no-cache-dir -r /app/requirements.txt

# 환경 변수 설정
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/src/main/Python/aivle-team0721-c72ab84f2251.json
ENV GOOGLE_CLOUD_PROJECT=aivle-team0721
ENV PYTHONPATH=/app

# Flask 앱 실행 (파일명 변경됨)
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 src.main.Python.Create_Terms:app
