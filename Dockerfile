# ---- Build Stage ----
FROM node:20-bullseye AS builder
WORKDIR /app

# 依存関係をコピーしてインストール
COPY package*.json ./
RUN npm ci

# ソースコードをコピーしてビルド
COPY . .
RUN npm run build

# ---- Run Stage ----
FROM node:20-bullseye AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# 本番用依存関係のみインストール
COPY package*.json ./
RUN npm ci --omit=dev

# ビルド成果物と必要なコードをコピー
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/ecosystem.config.cjs ./ecosystem.config.cjs

# PM2 をグローバルインストール
RUN npm install -g pm2

EXPOSE 3000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# PM2 でアプリ起動
CMD ["pm2-runtime", "start", "ecosystem.config.cjs", "--env", "production"]
