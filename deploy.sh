#!/bin/bash
set -e

##############################################
# CONFIG
##############################################
REGION="us-central1"
PROJECT="aivle-team0721"

TERMS_SERVICE_NAME="terms-api-service"
TERMS_IMAGE="us-central1-docker.pkg.dev/${PROJECT}/cloud-run-repo/terms-api:latest"

POINT_SERVICE_NAME="point-service"
POINT_IMAGE="us-central1-docker.pkg.dev/${PROJECT}/cloud-run-repo/point-api:latest"

FRONT_PATH="./frontend"

##############################################
# 1) 로컬 환경 체크
##############################################
echo "=== 1) 필수 도구 설치 확인 ==="
if ! command -v java &> /dev/null; then
    echo "❌ Java(JDK)가 설치되어 있지 않거나 PATH에 없습니다."
    echo "   PowerShell에서 'choco install openjdk11 -y' 실행 후 JAVA_HOME 설정 필요."
    exit 1
fi

if ! command -v mvn &> /dev/null; then
    echo "❌ Maven이 설치되어 있지 않습니다."
    echo "   PowerShell에서 'choco install maven -y' 실행 필요."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    exit 1
fi

if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI(gcloud)가 설치되어 있지 않습니다."
    exit 1
fi

# 기존 로컬 인증 변수 해제
unset GOOGLE_APPLICATION_CREDENTIALS

##############################################
# 2) Python API 빌드 & 배포
##############################################
echo "=== 2) Docker 빌드 (Python Terms API) ==="
docker build -t $TERMS_IMAGE .
docker push $TERMS_IMAGE

echo "=== 3) Cloud Run 배포 (Terms API) ==="
gcloud run deploy $TERMS_SERVICE_NAME \
  --image $TERMS_IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 1 \
  --set-env-vars SPRING_PROFILES_ACTIVE=docker

TERMS_URL=$(gcloud run services describe $TERMS_SERVICE_NAME --region $REGION --format 'value(status.url)')
echo "✅ Terms API URL: $TERMS_URL"

##############################################
# 4) Point API 빌드 & 배포
##############################################
echo "=== 4) Maven Build (Point API) ==="
cd point
mvn clean package -DskipTests

# JAR 파일 체크
JAR_FILE=$(ls target/*SNAPSHOT.jar | head -n 1)
if [ ! -f "$JAR_FILE" ]; then
    echo "❌ JAR 파일을 찾을 수 없습니다. Maven 빌드를 확인하세요."
    exit 1
fi

echo "=== 5) Docker 빌드 (Point API) ==="
docker build -t $POINT_IMAGE .
docker push $POINT_IMAGE

echo "=== 6) Cloud Run 배포 (Point API) ==="
gcloud run deploy $POINT_SERVICE_NAME \
  --image $POINT_IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 1 \
  --set-env-vars SPRING_PROFILES_ACTIVE=docker

POINT_URL=$(gcloud run services describe $POINT_SERVICE_NAME --region $REGION --format 'value(status.url)')
echo "✅ Point API URL: $POINT_URL"
cd ..

##############################################
# 7) 프론트엔드 빌드
##############################################
echo "=== 7) 프론트엔드 .env 업데이트 ==="
cat <<EOF > ${FRONT_PATH}/.env
REACT_APP_CLOUD_RUN_TERMS_API_BASE_URL=$TERMS_URL
REACT_APP_CLOUD_RUN_POINT_API_BASE_URL=$POINT_URL
EOF

echo "=== 8) 프론트엔드 빌드 ==="
cd $FRONT_PATH
npm install
npm run build
cd ..

##############################################
# 9) 로그 안내
##############################################
echo "=== ✅ 전체 배포 완료 ==="
echo "👉 Terms API Logs: gcloud run services logs read $TERMS_SERVICE_NAME --region=$REGION --project=$PROJECT --limit=100"
echo "👉 Point API Logs: gcloud run services logs read $POINT_SERVICE_NAME --region=$REGION --project=$PROJECT --limit=100"
