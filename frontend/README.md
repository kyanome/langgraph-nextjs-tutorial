# PDF チャットボットエージェント - フロントエンド

このディレクトリには、PDF チャットボットアプリケーションの Next.js フロントエンドが含まれています。リアルタイムなチャットインターフェース、PDF アップロード機能、ストリーミングレスポンス機能を提供します。

## 技術スタック

- **Next.js 14**: (App Router)
- **React 18**:
- **TypeScript**:
- **Tailwind CSS**:
- **Shadcn UI**:
- **Server-Sent Events**: リ

## ディレクトリ構造

```
frontend/
├── app/                   # Next.js App Router
│   ├── _components/       # 共有コンポーネント
│   │   ├── ChatMessage.tsx      # チャットメッセージ表示
│   │   ├── ExamplePrompts.tsx   # サンプルプロンプト
│   │   ├── InitialMessage.tsx   # 初期メッセージ
│   │   └── MessageForm.tsx      # メッセージ入力フォーム
│   ├── _constants/        # 定数と設定
│   │   └── graphConfigs.ts      # グラフ設定
│   ├── _lib/              # ユーティリティ関数
│   │   ├── langgraph-client.ts  # クライアント
│   │   ├── langgraph-base.ts    # 基本ユーティリティ
│   │   ├── langgraph-server.ts  # サーバーユーティリティ
│   │   └── pdf.ts                # PDF処理
│   ├── _types/            # TypeScript型定義
│   │   └── graphTypes.ts         # グラフ関連の型
│   ├── api/               # APIルート
│   │   ├── chat/          # チャットAPIエンドポイント
│   │   └── ingest/        # PDFインジェストエンドポイント
│   └── page.tsx           # メインページ（チャットUI）
├── components/            # UIコンポーネント
├── lib/                   # 共有ライブラリ
└── public/                # 静的アセット
```

## 主要コンポーネント

- **page.tsx**: メインチャット UI とロジック
- **MessageForm.tsx**: ユーザー入力、ファイルアップロード処理
- **ChatMessage.tsx**: チャットメッセージ表示とソース参照機能
- **ExamplePrompts.tsx**: サンプル質問表示

## API エンドポイント

### `/api/ingest`

PDF ドキュメントをアップロードして処理するエンドポイントです。

- **メソッド**: POST
- **入力**: マルチパートフォームデータ（PDF ファイル）
- **機能**:
  - PDF ファイルのバリデーション
  - バックエンド LangGraph サーバーへの送信
  - インジェクション処理の状態管理

### `/api/chat`

ユーザークエリを送信し、ストリーミングレスポンスを返すエンドポイントです。

- **メソッド**: POST
- **入力**: JSON（ユーザーメッセージとスレッド ID）
- **出力**: Server-Sent Events (SSE)
- **機能**:
  - バックエンドへのクエリ送信
  - SSE を使用したストリーミングレスポンス
  - ソースドキュメント参照情報の処理

## 環境変数の設定

`.env` ファイルを作成し、以下の変数を設定してください:

```
NEXT_PUBLIC_LANGGRAPH_API_URL=http://localhost:2024
LANGCHAIN_API_KEY=your-langsmith-api-key-here # オプション
LANGGRAPH_INGESTION_ASSISTANT_ID=ingestion_graph
LANGGRAPH_RETRIEVAL_ASSISTANT_ID=retrieval_graph
LANGCHAIN_TRACING_V2=true # オプション
LANGCHAIN_PROJECT="pdf-chatbot" # オプション
```

### 環境変数の説明

- `NEXT_PUBLIC_LANGGRAPH_API_URL`: LangGraph バックエンドの URL
- `LANGCHAIN_API_KEY`: LangSmith の API キー（デバッグ用、オプション）
- `LANGGRAPH_INGESTION_ASSISTANT_ID`: ドキュメントインジェスト用グラフ ID
- `LANGGRAPH_RETRIEVAL_ASSISTANT_ID`: 質問応答用グラフ ID
- `LANGCHAIN_TRACING_V2`: LangSmith トレーシング有効化フラグ
- `LANGCHAIN_PROJECT`: LangSmith プロジェクト名

## インストールと実行

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

サーバーはデフォルトで http://localhost:3000 で起動します。

## カスタマイズ方法

フロントエンドは簡単にカスタマイズできます：

- **ファイルアップロード制限**: `app/api/ingest/route.ts`でファイルサイズと数の制限を変更
- **UI スタイリング**: Tailwind と Shadcn UI を使用してスタイル変更
- **プロンプト例**: `app/_components/ExamplePrompts.tsx`で表示される例を変更
- **グラフ設定**: `app/_constants/graphConfigs.ts`で LangGraph への設定を変更

## トラブルシューティング

1. **API 接続エラー**:

   - 環境変数`NEXT_PUBLIC_LANGGRAPH_API_URL`が正しく設定されているか確認
   - バックエンドサーバーが実行中か確認

2. **PDF アップロードエラー**:

   - ファイルサイズ制限（デフォルト: 10MB）を確認
   - ファイル数制限（デフォルト: 5 ファイル）を確認
   - ファイル形式が PDF であることを確認

3. **ストリーミングエラー**:
   - ブラウザが Server-Sent Events（SSE）をサポートしているか確認
   - ネットワーク接続を確認

## ビルドとデプロイ

```bash
# プロダクションビルドの作成
npm run build

# ビルドの実行
npm run start
```

## 参考資料

- [Next.js ドキュメント](https://nextjs.org/docs)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Server-Sent Events MDN](https://developer.mozilla.org/ja-JP/docs/Web/API/Server-sent_events)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)
