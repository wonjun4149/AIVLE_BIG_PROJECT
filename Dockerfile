# 파이썬 공식 이미지를 기반으로 합니다.
FROM python:3.9-slim-buster

# Cloud Run은 PORT 환경 변수를 통해 요청을 보냅니다. 기본 8080.
ENV PORT 8080

# 작업 디렉토리를 /app으로 설정
WORKDIR /app

# Google Cloud 서비스 계정 키 파일을 컨테이너 내부에 복사
# 호스트 경로: /workspaces/AIVLE_BIG_PROJECT/ai/src/main/Python/aivle-team0721-c72ab84f2251.json
# 컨테이너 내 경로: /app/src/main/Python/aivle-team0721-c72ab84f2251.json (Flask 앱과 동일한 내부 경로 유지)
COPY ai/src/main/Python/aivle-team0721-c72ab84f2251.json /app/src/main/Python/aivle-team0721-c72ab84f2251.json

# ai/src/main/Python 디렉토리의 모든 내용을 컨테이너의 /app/src/main/Python으로 복사
# 여기에는 Create-Terms.py 파일과 약관 폴더들(예금약관 등)이 포함됩니다.
COPY ai/src/main/Python/ /app/src/main/Python/

# ai/requirements.txt 파일을 컨테이너의 /app/requirements.txt로 복사
COPY ai/requirements.txt /app/requirements.txt

# 추가 디렉토리들 복사
# 호스트 경로: /workspaces/AIVLE_BIG_PROJECT/point -> 컨테이너: /app/point
COPY point/ /app/point/
# 호스트 경로: /workspaces/AIVLE_BIG_PROJECT/term -> 컨테이너: /app/term
COPY term/ /app/term/
# 호스트 경로: /workspaces/AIVLE_BIG_PROJECT/user -> 컨테이너: /app/user/
COPY user/ /app/user/


# Python 의존성 설치
RUN pip install --no-cache-dir -r /app/requirements.txt

# 서비스 계정 키 파일 경로 환경 변수 설정
# 이 환경 변수는 컨테이너 내부의 경로를 지정합니다.
ENV GOOGLE_APPLICATION_CREDENTIALS /app/src/main/Python/aivle-team0721-c72ab84f2251.json
ENV GOOGLE_CLOUD_PROJECT aivle-team0721

# Flask 앱 실행 명령어 (Gunicorn WSGI 서버 사용)
# src.main.Python.Create-Terms:app는 컨테이너 내부 경로 /app을 기준으로
# Create-Terms.py 파일 내의 'app'이라는 Flask 애플리케이션 객체를 찾습니다.
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 src.main.Python.Create-Terms:app