#!/usr/bin/env bash
set -euo pipefail

# Quick helper to print out your RDS endpoint and connect via psql
# Usage: ./setup-db.sh <env>
ENV="${1:-dev}"

# Fetch outputs from Terraform state
ENDPOINT=$(cd aws && terraform output -raw db_address)
USERNAME=$(cd aws && terraform output -raw db_username) 2>/dev/null || USERNAME="boxed_admin"

echo "Your RDS endpoint for '${ENV}' is: $ENDPOINT"
echo "Connecting via psql..."
psql "postgresql://${USERNAME}@${ENDPOINT}:5432/boxeddb?sslmode=require"
