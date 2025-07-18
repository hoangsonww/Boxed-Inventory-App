#!/usr/bin/env bash
set -euo pipefail

# Build, tag, and push the web image to ECR
# Usage: ./push-ecr.sh <env> <aws-region> <aws-account-id>
ENV="${1:-dev}"
REGION="${2:-us-east-1}"
ACCOUNT="${3:?Must supply AWS account ID}"
REPO="boxed-web-${ENV}"
TAG="latest"

# Ensure you've already run login-ecr.sh
echo "Building Docker image..."
docker build -t "${REPO}:${TAG}" -f web/Dockerfile web

echo "Tagging image..."
docker tag "${REPO}:${TAG}" "${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:${TAG}"

echo "Pushing to ECR..."
docker push "${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:${TAG}"

echo "✅ Pushed ${REPO}:${TAG}"
