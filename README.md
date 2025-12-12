# Personal Shopper App 🛍️✨

海外ファン向けの推し活グッズ代理購入アプリ（Personal Shopper App）のMVP

## 🚀 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime

## 📋 セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com)で新しいプロジェクトを作成
2. `supabase/schema.sql`の内容をSupabase SQL Editorで実行
3. Storage Bucketsを作成:
   - `request-images` (公開読み取り、認証ユーザーのみアップロード)
   - `message-images` (認証ユーザーのみ読み取り/アップロード)

### 3. 環境変数の設定

`.env.local.example`をコピーして`.env.local`を作成:

```bash
cp .env.local.example .env.local
```

`.env.local`にSupabaseの認証情報を設定:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 📁 プロジェクト構造

詳細は`PROJECT_STRUCTURE.md`を参照してください。

## 🗄️ データベーススキーマ

### テーブル

1. **users** - ユーザー情報（auth.usersを拡張）
2. **requests** - 購入リクエスト
3. **messages** - ユーザーと管理者のチャットメッセージ

詳細は`supabase/schema.sql`を参照してください。

## 🎨 デザインコンセプト

- **テーマ**: Cyberpunk/Anime aesthetic
- **カラーパレット**: 
  - ネオンピンク（#FF1493, #FF69B4）
  - ダークモード背景（#0A0A0F, #1A1A2E）
  - アクセントカラー（#00FFFF, #7B2CBF）

## 📝 主要機能

- ✅ ユーザー認証（Supabase Auth）
- ✅ リクエスト作成・管理
- ✅ リアルタイムチャット機能（Supabase Realtime）
- ✅ 画像アップロード（Supabase Storage）
- ✅ 管理者ダッシュボード
- ✅ ロールベースアクセス制御

## 🔐 認証とセキュリティ

- Row Level Security (RLS) を有効化
- ユーザーは自分のデータのみアクセス可能
- 管理者は全データにアクセス可能

## 📚 次のステップ

1. Supabase Storageのポリシー設定
2. 各ページコンポーネントの実装
3. チャットUI/UXの実装
4. 画像アップロード機能の実装

