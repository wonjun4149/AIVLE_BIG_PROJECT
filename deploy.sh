#!/bin/bash
set -e

REGION="us-central1"
PROJECT="aivle-team0721"
SERVICE_NAME="terms-api-service"
IMAGE="us-central1-docker.pkg.dev/${PROJECT}/cloud-run-repo/terms-api:latest"
FRONT_PATH="./frontend"

echo "=== 1) 로컬 환경변수 초기화 ==="
unset GOOGLE_APPLICATION_CREDENTIALS

echo "=== 2) Docker 이미지 빌드 & 푸시 ==="
docker build -t $IMAGE .
docker push $IMAGE

echo "=== 3) Cloud Run 배포 ==="
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 1

echo "=== 4) Cloud Run URL 가져오기 ==="
API_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo "✅ API URL: $API_URL"

echo "=== 5) 프론트엔드 .env 업데이트 ==="
echo "REACT_APP_CLOUD_RUN_API_BASE_URL=$API_URL" > ${FRONT_PATH}/.env

echo "=== 6) 프론트엔드 빌드 ==="
cd $FRONT_PATH
npm install
npm run build

echo "=== ✅ 전체 배포 완료 ==="
