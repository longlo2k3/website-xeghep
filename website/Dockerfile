# ==========================================
# 1. Base Image
# ==========================================
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ==========================================
# 2. Dependencies
# ==========================================
FROM base AS deps
COPY package*.json ./
RUN npm install

# ==========================================
# 3. Builder
# ==========================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Baked in at build time: next.config rewrites (/api/v1/*) and the
# client-side bundle (NEXT_PUBLIC_*) are evaluated during `next build`,
# so they MUST be provided as build args (see docker-compose.yml).
ARG CMS_URL=http://backend:4001
ARG NEXT_PUBLIC_CMS_URL=
ENV CMS_URL=$CMS_URL
ENV NEXT_PUBLIC_CMS_URL=$NEXT_PUBLIC_CMS_URL

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=4000

RUN npm run build

# ==========================================
# 4. Production Runner
# ==========================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 4000

CMD ["npm", "run", "start"]
