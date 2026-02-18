# Maple Travel Log

カップル向け旅行ログアプリケーション - 日本地図上で訪問した場所をピンで記録し、2人で共同管理できます。

## 🌟 主な機能

- **日本地図可視化**: D3.js + SVG で日本地図を描画、都道府県別の訪問回数で色分け表示
- **ピン管理**: 地図上のクリックで場所を追加、詳細情報の編集・削除
- **認証システム**: 2人限定のメール制限認証（ALLOWED_EMAILS環境変数で管理）
- **リアルタイム共同編集**: ポーリング方式でデータの自動同期
- **統計機能**: 都道府県別訪問回数の統計表示
- **グループ管理**: 招待コードでのグループ参加

## 🏗 技術構成

### フロントエンド
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **D3.js** (地図描画)

### バックエンド
- **Hono** (TypeScript)
- **Prisma ORM**
- **bcrypt + httpOnly Cookie** (認証)

### データベース
- **開発**: Docker PostgreSQL
- **本番**: Supabase / Neon (PostgreSQL)

### デプロイ
- **フロントエンド**: Vercel / Cloudflare Pages
- **バックエンド**: Cloudflare Workers / AWS Lambda
- **データベース**: Supabase / Neon (無料枠対応)

## 🚀 ローカル開発セットアップ

### 必要な環境
- Node.js 18+
- Docker & Docker Compose
- npm

### 1. リポジトリのクローンと依存関係のインストール

\`\`\`bash
git clone <repository-url>
cd maple
npm install
\`\`\`

### 2. 環境変数の設定

\`\`\`bash
cp .env.example .env
\`\`\`

`.env` ファイルを編集:

\`\`\`env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/maple_dev"

# Authentication
JWT_SECRET="your-secret-key-change-in-production"
ALLOWED_EMAILS="user1@example.com,user2@example.com"

# Backend
PORT=3001

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001"
\`\`\`

### 3. データベースの起動とセットアップ

\`\`\`bash
# PostgreSQL コンテナの起動
docker-compose up -d

# Prisma クライアントの生成
npm run db:generate

# データベーススキーマの適用
npm run db:push
\`\`\`

### 4. アプリケーションの起動

\`\`\`bash
# フロントエンド・バックエンド同時起動
npm run dev

# または個別に起動
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:3001
\`\`\`

### 5. 初期設定

1. ブラウザで `http://localhost:3000` にアクセス
2. ALLOWED_EMAILS で設定したメールアドレスでユーザー登録
3. グループを作成し、2人目のユーザーを招待コードで招待
4. 地図上をクリックしてピンを追加

## 📦 本番デプロイ

### Vercel + Cloudflare Workers + Supabase 構成

#### 1. Supabase プロジェクトの作成

1. [Supabase](https://supabase.com) でプロジェクト作成
2. データベースURLを取得: `Settings → Database → Connection string`

#### 2. バックエンド (Cloudflare Workers)

\`\`\`bash
cd apps/backend

# Wranglerでログイン
npx wrangler login

# 環境変数の設定
npx wrangler secret put DATABASE_URL
npx wrangler secret put JWT_SECRET
npx wrangler secret put ALLOWED_EMAILS

# デプロイ
npm run deploy:cloudflare
\`\`\`

#### 3. フロントエンド (Vercel)

1. [Vercel](https://vercel.com) でGitHubリポジトリを接続
2. Root Directory を `apps/frontend` に設定
3. 環境変数を設定:
   - `NEXT_PUBLIC_API_URL`: CloudflareワーカーのURL

#### 4. データベースマイグレーション

\`\`\`bash
# 本番データベースにマイグレーション適用
DATABASE_URL="<supabase-url>" npm run db:push
\`\`\`

### Neon + AWS Lambda 構成

#### 1. Neon データベース

1. [Neon](https://neon.tech) でプロジェクト作成
2. データベースURLを取得

#### 2. AWS Lambda デプロイ

\`\`\`bash
cd apps/backend

# Lambda用にビルド
npm run build

# デプロイツール（Serverless Framework等）を使用
# または AWS Console で手動デプロイ
\`\`\`

## 🔒 セキュリティ設定

### 認証制限

環境変数 `ALLOWED_EMAILS` でログイン可能なユーザーを制限:

\`\`\`env
ALLOWED_EMAILS="user1@example.com,user2@example.com"
\`\`\`

### Cookie設定

- httpOnly: XSS攻撃防止
- secure: HTTPS環境でのみ送信
- sameSite: CSRF攻撃防止

## 📊 データベーススキーマ

### 主要テーブル

- **users**: ユーザー情報
- **couple_groups**: グループ情報
- **group_members**: グループメンバー関係
- **place_pins**: 場所ピン情報

### リレーション

- User 1:N GroupMember N:1 CoupleGroup
- User 1:N PlacePin N:1 CoupleGroup

## 🛠 開発者向け情報

### コマンド一覧

\`\`\`bash
# 開発
npm run dev                 # 全体起動
npm run dev:frontend       # フロントエンドのみ
npm run dev:backend        # バックエンドのみ

# ビルド
npm run build              # 全体ビルド
npm run type-check         # 型チェック
npm run lint               # リント

# データベース
npm run db:generate        # Prismaクライアント生成
npm run db:push           # スキーマ適用
npm run db:studio         # Prisma Studio起動
\`\`\`

### パッケージ構成

\`\`\`
apps/
  frontend/          # Next.js アプリケーション
  backend/           # Hono API サーバー
packages/
  shared/            # 共通型定義・スキーマ
prisma/              # データベーススキーマ
\`\`\`

### 共同編集の仕組み

- フロントエンドで10秒間隔のポーリング実行
- データハッシュ値比較による差分検出
- フォーム表示中はポーリング一時停止
- ブラウザタブ非アクティブ時は自動停止

## 🚧 今後の拡張予定

### 技術的改善

- **WebSocket対応**: Socket.io / Pusher連携
- **AWS Cognito**: 認証システム強化
- **画像アップロード**: Cloudflare R2 / Supabase Storage
- **プッシュ通知**: Service Worker対応

### 機能追加

- 写真付きピン
- 旅行ルート表示
- 思い出のタイムライン
- データエクスポート機能

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

Issues・Pull Requestsを歓迎します。

## 📞 サポート

技術的な質問やバグ報告は GitHub Issues までお願いします。