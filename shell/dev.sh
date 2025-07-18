#!/usr/bin/env bash
set -euo pipefail

# Start everything you need for local development:
# - Supabase emulator
# - Next.js dev server
# - (optional) Watchers, etc.

echo "⏳ Starting Supabase emulator..."
# Requires supabase CLI installed and a supabase.toml in project root
supabase start &

echo "⏳ Waiting for Supabase to be ready..."
sleep 5

echo "⏳ Running database migrations (if any)..."
supabase db push

echo "✅ Supabase ready."
echo "🚀 Starting Next.js in dev mode..."
cd web
npm run dev
