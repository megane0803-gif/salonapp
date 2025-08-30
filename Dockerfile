# ========================================
# Gmail Integration Web Application - Production Docker Build
# ========================================
# Playwright公式イメージをベースに採用（ブラウザ操作・スクレイピング等が安定する）
FROM mcr.microsoft.com/playwright:v1.40.0-focal AS builder

# 作業ディレクトリを /app に設定
WORKDIR /app

# ========================================
# 依存パッケージのインストール（dev依存も含む）
# ========================================
# まず package.json / package-lock.json をコピー
COPY package*.json ./

# devDependencies（vite や tsc 等）も含めてインストール
RUN npm ci

# ========================================
# ソースコードをコピー & ビルド
# ========================================
COPY . .
# buildスクリプトが存在しない場合もコケないように --if-present を付与
RUN npm run build --if-present

# 本番用に devDependencies を削除（軽量化）
RUN npm prune --omit=dev

# ========================================
# 本番用ランナーイメージ
# ========================================
FROM mcr.microsoft.com/playwright:v1.40.0-focal AS runner
WORKDIR /app

# 環境変数の設定
ENV NODE_ENV=production
ENV PORT=3000
ENV TZ=Asia/Tokyo

# ========================================
# 必要な成果物だけコピー
# ========================================
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public 2>/dev/null || true
COPY --from=builder /app/src ./src 2>/dev/null || true
COPY --from=builder /app/ecosystem.config.cjs ./ 2>/dev/null || true

# ========================================
# ポート公開 & 起動コマンド
# ========================================
EXPOSE 3000

# 起動は package.json の "start" を利用
# 例: "start": "node dist/server.js"
CMD ["npm", "start"]

# PM2を使いたい場合はこちらを代わりに使用可能
# CMD ["npx","pm2-runtime","start","ecosystem.config.cjs","--env","production"]

# ========================================
# メタデータ（任意）
# ========================================
LABEL maintainer="Gmail Integration App"
LABEL version="1.0.0"
LABEL description="予約一括管理システム - Gmail API integration"
