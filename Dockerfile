# ---- Base Image ----
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# 必要なシステム依存を入れる
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# pm2 をグローバルインストール
RUN npm install -g pm2

# package.json だけ先にコピーして依存関係をインストール
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ソースコードをコピー
COPY . .

# build（フロントがある場合）
RUN npm run build || echo "skip build"

# ログ・必要フォルダ作成
RUN mkdir -p logs public/static dist

# 非rootユーザーを作成して権限移行（セキュリティ的に安心）
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 3000

# pm2-runtime で起動
CMD ["pm2-runtime", "start", "ecosystem.config.cjs", "--env", "production"]
