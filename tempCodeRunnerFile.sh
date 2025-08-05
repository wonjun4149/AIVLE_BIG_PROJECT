#!/bin/bash
set -e

REGION="us-central1"
PROJECT="aivle-team0721"

TERMS_SERVICE_NAME="terms-api-service"
TERMS_IMAGE="us-central1-docker.pkg.dev/${PROJECT}/cloud-run-repo/terms-api:latest"

echo "=== 🔧 Docker 빌드: Terms API ==="
docker build --platform linux/amd64 -t $TERMS_IMAGE .
docker push $TERMS_IMAGE

echo "=== ☁️ Cloud Run 배포: Terms API ==="
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

echo "=== ✅ Terms API 배포 완료 ==="
