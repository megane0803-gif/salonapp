# ---- builder: dev依存も含めてインストール & ビルド ----
FROM node:20-bullseye AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci                       # devDependencies も含めてインストール
COPY . .
RUN npm run build                # ここで dist/ を作る

# ---- runner: 本番起動用（軽量） ----
FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# 本番依存だけインストール
COPY package*.json ./
RUN npm ci --omit=dev

# 必要な成果物だけコピー（全コピーはしない）
COPY --from=builder /app/dist ./dist
# もし実行時に config/ などが要る場合は個別に追加
# COPY --from=builder /app/config ./config

EXPOSE 3000
CMD ["npm","start"]
