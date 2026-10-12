# ==========================================
# 1. Build Stage
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Cho phép truyền URL backend lúc build nếu cần (mặc định để rỗng /api để reverse-proxy tự xử lý)
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ==========================================
# 2. Production Stage (Nginx)
# ==========================================
FROM nginx:alpine AS runner

# Sao chép các tệp tĩnh đã build từ builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Cấu hình Nginx chuyên dụng cho SPA và reverse-proxy API/Media
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
