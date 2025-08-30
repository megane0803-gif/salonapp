# Gmail認証設定手順

## 現在の状況
- 開発用モック認証が動作中
- 実際のGmail認証を使用するには追加設定が必要

## Google Cloud Console設定手順

### 1. プロジェクト作成
1. https://console.cloud.google.com/ にアクセス
2. 新しいプロジェクトを作成

### 2. Gmail API有効化
1. 「APIとサービス」→「ライブラリ」
2. 「Gmail API」を検索して有効化

### 3. OAuth認証情報作成
1. 「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「OAuthクライアントID」
3. アプリケーションの種類：「ウェブアプリケーション」
4. 承認済みリダイレクトURI：
   - `http://localhost:3000/oauth/google/callback`
   - `https://your-domain.pages.dev/oauth/google/callback`

### 4. OAuth同意画面設定
1. 「OAuth同意画面」タブ
2. 外部ユーザー（個人利用）
3. アプリ情報入力
4. スコープ追加：`https://www.googleapis.com/auth/gmail.readonly`

### 5. 環境変数更新
`.dev.vars`ファイルを更新：
```bash
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/google/callback
```

### 6. サービス再起動
```bash
cd /home/user/webapp
fuser -k 3000/tcp 2>/dev/null || true
npm run build
pm2 start ecosystem.config.cjs
```

## テスト手順
1. http://localhost:3000/oauth/google/start にアクセス
2. 実際のGoogle認証画面が表示されることを確認
3. Gmail連携を完了

## 注意事項
- OAuth設定が完了するまではモック認証が使用されます
- 本番環境では必ず実際の認証を使用してください
- テスト用アカウントでの動作確認を推奨します