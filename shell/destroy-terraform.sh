#!/usr/bin/env bash
set -euo pipefail

# Tear down all AWS resources
# Usage: ./destroy-terraform.sh <env> <db-password> <google-ai-key>
ENV="${1:-dev}"
DB_PASS="${2:?Must supply DB password}"
AI_KEY="${3:?Must supply Google AI key}"

export TF_VAR_env="$ENV"
export TF_VAR_db_password="$DB_PASS"
export TF_VAR_google_ai_key="$AI_KEY"

echo "⚠️  Destroying infrastructure for '${ENV}'..."
(cd aws && terraform destroy -auto-approve -var="env=${ENV}")
echo "✅ Infrastructure destroyed"
