# Web App Starter

Next.js（App Router）+ TypeScript + Tailwind CSS の実用スターターひな型です。

## セットアップ

```bash
cp .env.example .env.local
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開きます。

ヘルスチェック: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## スクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー |
| `npm run lint` | ESLint |

## ディレクトリ構成

```text
src/
  app/                 # ルーティング・ページ・API
  components/
    ui/                # 汎用 UI
    layout/            # ヘッダー等
  lib/                 # ロジック・env・ユーティリティ
  types/               # 共有型
  hooks/               # クライアントフック
  data/                # モック・シード
```

## 環境変数

`.env.example` を `.env.local` にコピーして使います。

| 変数 | 説明 |
|------|------|
| `NEXT_PUBLIC_APP_NAME` | アプリ表示名 |

検証ロジックは `src/lib/env.ts` にあります。変数を増やしたら schema と `.env.example` の両方を更新してください。

## 新機能の追加手順

1. `src/types/` に型を定義する
2. `src/lib/` にロジック・データ取得を置く（必要なら `src/data/` にモック）
3. `src/app/` にページや `api/` Route を追加する
4. UI は `src/components/ui/`（汎用）または `src/components/<domain>/`（固有）へ

## AI 開発

プロジェクトルールは [`.cursorrules`](.cursorrules) にあります。Cursor エージェント向けの共通方針です。
