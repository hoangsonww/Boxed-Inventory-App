#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Running ESLint..."
cd web && npm run lint

echo "✅ Linting passed."
