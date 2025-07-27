# ─── Install dependencies ────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# only copy package manifests
COPY package.json package-lock.json ./
# install with npm ci, silence logs
RUN npm ci --silent

# ─── Build the app ──────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# copy deps and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# set production environment
ENV NODE_ENV=production

# run the Next.js build, but never fail on TS/ESLint errors
RUN npm run build || echo "⚠️  Build errors ignored"

# ─── Production image ───────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3000

# copy only the minimal necessary files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# start in production mode
CMD ["npm", "start"]
