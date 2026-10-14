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

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=4001
ENV PAYLOAD_SECRET=build_dummy_secret_at_least_32_characters_long
ENV DATABASE_URI=postgresql://cms:cms@localhost:5432/cms
ENV PAYLOAD_DB_PUSH=false

RUN npm run build

# ==========================================
# 4. Production Runner
# ==========================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4001
ENV NEXT_TELEMETRY_DISABLED=1

# Sao chép các tệp cần thiết cho production & các script seed/migration (tsx)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Thư mục lưu trữ media uploads (được mount volume từ docker-compose)
RUN mkdir -p media

EXPOSE 4001

CMD ["npm", "run", "start"]
