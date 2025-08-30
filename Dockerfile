# ---------- base ----------
FROM node:20-bullseye AS base
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# タイムゾーン（任意）
ENV TZ=Asia/Tokyo

# ---------- builder: dev依存も含めてインストール & ビルド ----------
FROM node:20-bullseye AS builder
WORKDIR /app

# 依存だけ先に入れてキャッシュ効かせる
COPY package*.json ./
RUN npm ci

# 全ソースをコピーしてビルド
COPY . .
# buildスクリプトがなくてもコケない
RUN npm run build --if-present

# ここで dev依存を取り除いたnode_modulesを用意しておく
RUN npm prune --omit=dev

# ---------- runner: 本番起動 ----------
FROM base AS runner
WORKDIR /app

# ビルド成果物 & 実行に必要なファイルをコピー
# 1) ビルド済みの dist（存在する場合）
COPY --from=builder /app/dist ./dist
# 2) 実行に必要なその他のファイル（sql や設定など）
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/ecosystem.config.cjs ./  2>/dev/null || true
COPY --from=builder /app/*.sql ./                 2>/dev/null || true
COPY --from=builder /app/public ./public          2>/dev/null || true
COPY --from=builder /app/src ./src                2>/dev/null || true
COPY --from=builder /app/vercel.json ./           2>/dev/null || true
COPY --from=builder /app/wrangler.json ./         2>/dev/null || true

# 3) prod用の node_modules をコピー（devは削除済）
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
# package.json の "start" をそのまま実行（pm2でもnodeでもOK）
CMD ["npm","start"]
