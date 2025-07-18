#!/usr/bin/env bash
set -euo pipefail

# Initialize, plan and apply Terraform in aws/
# Usage: ./deploy-terraform.sh <env> <db-password> <google-ai-key>
ENV="${1:-dev}"
DB_PASS="${2:?Must supply DB password}"
AI_KEY="${3:?Must supply Google AI key}"

# export vars for Terraform
export TF_VAR_env="$ENV"
export TF_VAR_db_password="$DB_PASS"
export TF_VAR_google_ai_key="$AI_KEY"

echo "🛠  Initializing Terraform..."
(cd aws && terraform init)

echo "🔍 Planning infrastructure for '${ENV}'..."
(cd aws && terraform plan -var="env=${ENV}")

echo "🚀 Applying infrastructure..."
(cd aws && terraform apply -auto-approve -var="env=${ENV}")

echo "✅ Infrastructure applied"
