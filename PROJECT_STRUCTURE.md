# Personal Shopper App - プロジェクト構造

## ディレクトリ構造

```
Personal-Shopper-App/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # ルートレイアウト
│   ├── page.tsx                 # LP (Top)
│   ├── (auth)/                  # 認証グループ
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (user)/                  # ユーザー専用ページ
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # リクエスト一覧
│   │   │   └── layout.tsx
│   │   ├── requests/
│   │   │   ├── new/
│   │   │   │   └── page.tsx     # リクエスト作成フォーム
│   │   │   └── [id]/
│   │   │       └── page.tsx     # リクエスト詳細 & チャット
│   │   └── layout.tsx
│   ├── (admin)/                 # 管理者専用ページ
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # 全リクエスト管理
│   │   │   └── layout.tsx
│   │   ├── requests/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # 管理者チャット画面
│   │   └── layout.tsx
│   └── api/                     # API Routes (必要に応じて)
│       └── ...
├── components/                  # 再利用可能なコンポーネント
│   ├── ui/                     # 基本的なUIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── chat/                   # チャット関連コンポーネント
│   │   ├── MessageList.tsx
│   │   ├── MessageItem.tsx
│   │   ├── MessageInput.tsx
│   │   └── ImageUpload.tsx
│   ├── requests/               # リクエスト関連コンポーネント
│   │   ├── RequestCard.tsx
│   │   ├── RequestForm.tsx
│   │   └── StatusBadge.tsx
│   └── layout/                 # レイアウトコンポーネント
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/                        # ユーティリティとライブラリ
│   ├── supabase/
│   │   ├── client.ts           # Supabaseクライアント
│   │   ├── server.ts           # サーバーサイドクライアント
│   │   └── types.ts            # データベース型定義
│   ├── hooks/                  # カスタムフック
│   │   ├── useMessages.ts      # メッセージ管理
│   │   ├── useRequests.ts      # リクエスト管理
│   │   └── useRealtime.ts      # Realtime購読
│   └── utils/
│       ├── storage.ts          # Storage操作
│       └── validation.ts
├── styles/                     # グローバルスタイル
│   └── globals.css
├── supabase/                   # Supabase関連
│   ├── schema.sql              # データベーススキーマ
│   └── migrations/             # マイグレーション（必要に応じて）
├── types/                      # TypeScript型定義
│   ├── database.ts
│   └── index.ts
├── public/                     # 静的ファイル
│   └── ...
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .env.local                  # 環境変数（.gitignoreに含める）
└── README.md
```

## 主要な技術スタック

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime

## デザイン方針

- **テーマ**: Cyberpunk/Anime aesthetic
- **カラーパレット**: 
  - ネオンピンク（#FF1493, #FF69B4）
  - ダークモード背景（#0A0A0F, #1A1A2E）
  - アクセントカラー（#00FFFF, #7B2CBF）
- **フォント**: モダンなサンセリフ + 日本語対応

## 認証フロー

1. ユーザー登録/ログイン → Supabase Auth
2. 認証後、`users`テーブルにプロフィール作成
3. ロールベースアクセス制御（user/admin）

## Realtime機能

- `messages`テーブルへの変更をリアルタイムで購読
- 新規メッセージの即時反映
- 既読/未読状態の同期

