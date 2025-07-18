#!/usr/bin/env bash
set -euo pipefail

# Log in to AWS ECR so you can push images
# Usage: ./login-ecr.sh <aws-region> <aws-account-id>
REGION="${1:-us-east-1}"
ACCOUNT="${2:?Must supply AWS account ID}"

echo "Logging in to ECR in ${REGION} for account ${ACCOUNT}..."
aws ecr get-login-password --region "${REGION}" |
  docker login --username AWS --password-stdin "${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com"
echo "✅ Logged into ECR"
