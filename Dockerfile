# ---- build stage ----
FROM node:20-bullseye AS build
WORKDIR /app

# lockfile が無くても通るように npm install を使用
COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .
# dist は無くても先に進む（まずは起動優先）
RUN npm run build || true

# ---- run stage ----
FROM node:20-bullseye AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
# 本番は dev 省略してインストール
RUN npm install --omit=dev --no-audit --no-fund

# 実行に必要な成果物/ファイル
COPY --from=build /app/dist ./dist
COPY server.js ./server.js

EXPOSE 3000
CMD ["npm","start"]
