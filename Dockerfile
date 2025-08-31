# ---- runner only（buildなし）----
FROM node:20-bullseye AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV TZ=Asia/Tokyo

# 依存インストール
COPY package*.json ./
RUN npm install --omit=dev || npm install

# ソースをそのままコピー
COPY . .

EXPOSE 3000

# "start" スクリプトでサーバー起動
CMD ["npm","start"]
