# わりかん

友達との飲み会・旅行などで「誰が何を払ったか」を記録し、精算（誰が誰にいくら渡すか）を自動で出すアプリです。

## セットアップ

```bash
cp .env.example .env.local
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開きます。

## 使い方

1. イベント（飲み会など）を作成する
2. メンバーを追加する
3. 支払い（誰が・いくら・対象者）を記録する
4. 精算結果の送金メモを見てやり取りする

データはブラウザの localStorage に保存されます（この端末のみ）。

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
    warikan/           # 割り勘 UI
  lib/warikan/         # 精算ロジック・保存
  types/               # 共有型
  hooks/               # クライアントフック
```
