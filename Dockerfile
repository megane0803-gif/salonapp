# ---- builder: dev依存も含めてインストール & ビルド ----
FROM node:20-bullseye AS builder
WORKDIR /app

COPY package*.json ./
# devDependencies を含めてインストール
RUN npm ci

# 全ソースをコピーしてビルド
COPY . .
# ここで vite 等を使ったビルドが走る
RUN npm run build

# ---- runner: 本番用に最小限で起動 ----
FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# production 依存のみインストール
COPY package*.json ./
RUN npm ci --omit=dev

# ビルド成果物と必要ファイルをコピー
COPY --from=builder /app/dist ./dist
COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm","start"]
