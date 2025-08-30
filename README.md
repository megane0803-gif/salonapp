# Salon Booking Sync System

ホットペッパービューティー（HPB）とLiMEの予約を、自作サイトで一括管理・自動同期するシステム

## プロジェクト概要

- **名前**: Salon Booking Sync System
- **目標**: HPBとLiMEの予約をSoT（真実の源泉）として自作サイトで一元管理し、サロンボードに自動同期
- **特徴**: 
  - HPBのメール通知から自動取込
  - LiMEをWebクロールで自動監視
  - サロンボードにAUTO_HOLDで確実に枠確保
  - PWA対応でiPad最適化
  - 全て無料構成（外部有料ミドルウェア不使用）

## 技術スタック

- **フロントエンド**: React + TypeScript (PWA対応)
- **バックエンド**: Node.js + TypeScript + Fastify
- **データベース**: PostgreSQL
- **キューシステム**: BullMQ (Redis)
- **自動操作**: Playwright (Chromium, headless)
- **認証**: セッションベース + TOTP二段階認証対応
- **ログ**: Winston構造化ログ + スクリーンショット/HTMLダンプ保存

## 主要機能

### 🔐 認証システム
- ID/パスワードログイン
- TOTP二段階認証（オプション）
- セッション管理（14日〜60日）
- レート制限・ブルートフォース対策

### 📝 予約管理（SoT）
- 予約CRUD操作
- 顧客・メニュー管理
- 重複・競合検知
- 信頼度スコア付き自動分類

### 🔄 外部システム連携
- **HPB**: Gmail通知を自動解析・取込
- **LiME**: Webクロール差分検知
- **サロンボード**: AUTO_HOLD自動作成・削除・移動

### 🎯 HOLD管理
- 指定日時の枠確保（AUTO_HOLD）
- 時間移動・一括削除
- サロンボードとの自動同期
- 失敗時の再試行機能

### 📊 監視・統計
- 予約統計・ダッシュボード
- ジョブ監視・エラーレポート
- 2FA待機状態の通知
- セキュリティ監査ログ

## データアーキテクチャ

### 主要テーブル
- `bookings`: 予約データ（SoT）
- `customers`: 顧客情報
- `menus`: メニュー・サービス
- `holds`: AUTO_HOLD管理
- `jobs`: 非同期ジョブ管理
- `raw_inputs`: 外部データの生ログ
- `audit_logs`: 変更履歴

### 外部システム連携
- **HPB**: `ext_refs.hpb.{id, last_hash}`
- **LiME**: `ext_refs.lime.{id, last_hash}`
- **サロンボード**: Playwright自動操作（storageState永続化）

## セットアップ

### 必要な環境
- Node.js 18+
- PostgreSQL 13+
- Redis 6+

### インストール
```bash
# 依存関係のインストール
npm install

# データベースのマイグレーション
npm run db:migrate

# シードデータの投入
npm run db:seed

# 開発サーバー起動（サーバー + ワーカープロセス）
npm run dev

# フルスタック開発（サーバー + ワーカー + フロントエンド）
npm run dev:full

# PM2でプロダクション風に起動
npm run start:pm2

# PM2での停止
npm run stop:pm2
```

### 環境変数設定
`.env.example`を`.env`にコピーして、必要な値を設定:
- `DATABASE_URL`: PostgreSQL接続文字列
- `REDIS_URL`: Redis接続文字列  
- `SB_USER`, `SB_PASS`: サロンボード認証情報
- `GOOGLE_OAUTH_*`: Gmail API認証情報

## API エンドポイント

### 認証
- `POST /auth/login` - ログイン
- `POST /auth/logout` - ログアウト
- `GET /auth/me` - 現在のユーザー情報
- `POST /auth/totp/setup` - 2FA設定

### 予約管理
- `GET /bookings` - 予約一覧
- `GET /bookings/:id` - 予約詳細
- `POST /bookings/confirm` - 予約確定/キャンセル
- `GET /bookings/needs-review` - 要確認予約

### HOLD管理
- `POST /holds` - HOLD作成（自動的にサロンボードジョブをキュー）
- `DELETE /holds` - HOLD削除（自動的にサロンボードジョブをキュー）
- `POST /holds/shift` - HOLD移動（自動的にサロンボードジョブをキュー）
- `GET /holds/daily/:staff/:date` - 日別HOLD一覧
- `POST /holds/:id/retry` - 失敗したHOLDの再試行

### ジョブ管理
- `GET /jobs/stats` - ジョブキュー統計
- `GET /jobs/health` - ジョブキューヘルスチェック
- `POST /jobs` - 手動ジョブ追加
- `POST /jobs/test` - テスト用ジョブ実行
- `GET /jobs/dashboard` - ダッシュボード用包括情報

### 自動化
- `POST /automation/2fa/submit` - Playwright 2FA入力
- `POST /sync/google-calendar/export` - Googleカレンダー出力

## 開発状況

### ✅ 完了
- [x] プロジェクト基盤構築
- [x] PostgreSQLデータベーススキーマ設計
- [x] 認証システム（セッション、TOTP準備）
- [x] 基本API（予約、HOLD管理）
- [x] ログ・設定システム
- [x] BullMQジョブキューシステム
- [x] サロンボードPlaywright自動操作（基本機能）

### 🚧 進行中
- [ ] HPBメール取込システム
- [ ] LiME Webクローラー
- [ ] React PWAフロントエンド

### 📋 予定
- [ ] Gmail Push通知連携
- [ ] Googleカレンダー出力
- [ ] E2Eテスト・デプロイ設定
- [ ] サロンボード自動操作の完全対応

## デプロイ情報

- **プラットフォーム**: 未定（Docker対応予定）
- **状態**: 開発中
- **最終更新**: 2024-12-20

## 次のステップ

1. BullMQジョブキューシステムの実装
2. サロンボードPlaywright自動操作の実装
3. HPBメール取込システムの実装
4. React PWAフロントエンドの実装
5. LiME Webクローラーの実装
6. E2Eテストの実装

---

**注意**: サロンボード・LiMEとも公式APIがない前提での自動操作実装です。利用規約を確認し、適切な頻度制御・監査ログを整備して運用してください。