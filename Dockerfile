# ---- builder: dev依存も含めてインストール & ビルド ----
FROM node:20-bullseye AS builder
WORKDIR /app

COPY package*.json ./
# devDependencies（vite など）も入れる
RUN npm ci

# 全ソースをコピーしてビルド
COPY . .
RUN npm run build

# ---- runner: 本番起動用 ----
FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# 本番依存だけ入れる
COPY package*.json ./
RUN npm ci --omit=dev

# ビルド成果物と必要ファイルをコピー
COPY --from=builder /app/dist ./dist
COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm","start"]
