# ✅ 1) Python 공식 slim 이미지 사용
FROM python:3.9-slim-buster

# ✅ 2) Cloud Run 기본 포트 설정
ENV PORT=8080

# ✅ 3) 작업 디렉토리
WORKDIR /app

# ✅ 4) Google Cloud 서비스 계정 키 파일 복사
COPY ai/src/main/Python/aivle-team0721-c72ab84f2251.json /app/src/main/Python/aivle-team0721-c72ab84f2251.json

# ✅ 5) 애플리케이션 소스 코드 복사
COPY ai/src/main/Python/ /app/src/main/Python/
COPY point/ /app/point/
COPY term/ /app/term/
COPY user/ /app/user/
COPY ai/requirements.txt /app/requirements.txt

# ✅ 6) Python 패키지 설치
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# ✅ 7) Google Cloud 인증 관련 환경 변수 설정
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/src/main/Python/aivle-team0721-c72ab84f2251.json
ENV GOOGLE_CLOUD_PROJECT=aivle-team0721

# ✅ 8) Python 모듈 검색 경로 추가
ENV PYTHONPATH=/app

# ✅ 9) Gunicorn으로 Flask 실행 (Create_Terms.py 파일 사용)
CMD ["gunicorn", "--bind", ":8080", "--workers", "1", "--threads", "8", "src.main.Python.Create_Terms:app"]
