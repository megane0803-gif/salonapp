# Node公式イメージ
FROM node:18

# 作業ディレクトリ
WORKDIR /app

# package.json だけコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# ソースコードをコピー
COPY . .

# 本番ビルド
RUN npm run build

# アプリを起動
CMD ["npm", "start"]
