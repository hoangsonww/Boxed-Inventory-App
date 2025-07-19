#!/usr/bin/env bash
set -euo pipefail

# ── CONFIGURE ──────────────────────────────────────────────
# source ../.env.production

export ANSIBLE_INVENTORY="inventory/production.ini"
export NEXT_PUBLIC_GOOGLE_AI_API_KEY="${NEXT_PUBLIC_GOOGLE_AI_API_KEY:?Must set GOOGLE_AI key}"
export DATABASE_URL="${DATABASE_URL:?Must set DATABASE_URL}"

# (Optional) override these with env vars or defaults:
export GIT_REPO="${GIT_REPO:-https://github.com/yourusername/boxed.git}"
export GIT_BRANCH="${GIT_BRANCH:-main}"
export APP_DOMAIN="${APP_DOMAIN:-example.com}"

# ── RUN PLAYBOOK ──────────────────────────────────────────
echo "👉  Deploying Boxed app to hosts in ${ANSIBLE_INVENTORY}"
ansible-playbook playbook.yml \
  -e "repo_url=${GIT_REPO}" \
  -e "branch=${GIT_BRANCH}" \
  -e "domain_name=${APP_DOMAIN}"

echo "🎉  Deployment complete!"
