# PDF チャットボットエージェント

## 概要

このリポジトリは、LangChain と LangGraph を活用した PDF チャットボットエージェントの実装です。このシステムは PDF ドキュメントを取り込み、ベクトルデータベース（Supabase）に埋め込みを保存し、OpenAI（または他の LLM プロバイダー）を使用してユーザーの質問に対して関連する文脈を考慮した応答を提供します。

主な特徴:

- **ドキュメント取り込み機能**:
- **インテリジェントな検索**:
- **ストリーミングレスポンス**:
- **LangGraph ワークフロー**:
- **Next.js フロントエンド**:

## インストール方法

### 前提条件

1. **Node.js v18+** (Node v20 推奨)
2. **Yarn** (または npm)
3. **Supabase プロジェクト**
   - 必要な情報:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `documents`テーブルと`match_documents`関数
4. **OpenAI API キー** (または他の LLM プロバイダー)
5. **LangChain API キー** (任意だがデバッグに推奨)

### インストール手順

1. **リポジトリのクローン**:

```bash
git clone https://github.com/kyanome/langgraph-nextjs-tutorial.git
cd langgraph-nextjs-tutorial
```

2. **依存関係のインストール**:

```bash
npm install
```

3. **環境変数の設定**:

バックエンド用に `.env` ファイルを作成:

```bash
cp backend/.env.example backend/.env
```

```
OPENAI_API_KEY=your-openai-api-key-here
SUPABASE_URL=your-supabase-url-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT="pdf-chatbot"
```

フロントエンド用に `.env` ファイルを作成:

```bash
cp frontend/.env.example frontend/.env
```

```
NEXT_PUBLIC_LANGGRAPH_API_URL=http://localhost:2024
LANGCHAIN_API_KEY=your-langsmith-api-key-here
LANGGRAPH_INGESTION_ASSISTANT_ID=ingestion_graph
LANGGRAPH_RETRIEVAL_ASSISTANT_ID=retrieval_graph
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT="pdf-chatbot"
```

## 使い方

### ローカル開発

1. **バックエンドの起動**:

```bash
cd backend
npx @langchain/langgraph-cli dev
```

これにより LangGraph サーバーがポート 2024 で起動します。

2. **フロントエンドの起動**:

```bash
cd frontend
npm run dev
```

Next.js の開発サーバーがポート 3000 で起動します。

3. **ブラウザでアクセス**:

ブラウザで `http://localhost:3000` にアクセスしてチャットボット UI を使用します。

### PDF のアップロードと質問

1. **PDF のアップロード**:

   - チャット入力エリアのクリップアイコンをクリックします
   - PDF ファイルを選択してアップロードします（最大 5 つまで、各 10MB 以下）
   - バックエンドが PDF を処理し、テキストを抽出して Supabase に埋め込みを保存します

2. **質問の方法**:
   - チャット入力フィールドに質問を入力します
   - 応答はリアルタイムでストリーミングされます
   - システムが文書を検索した場合、回答に使用された各テキストチャンクの「ソースを表示」リンクが表示されます

## アーキテクチャ

本システムは以下のコンポーネントで構成されています:

```
┌─────────────────────┐    1. PDFアップロード    ┌─────────────────────────┐
│フロントエンド       │ ────────────────────────> │バックエンド             │
│(Next.js)           │                          │(LangGraph)              │
│ - Reactチャット     │ <────────────────────────┤ - 取り込みグラフ         │
└─────────────────────┘    2. 確認               │   + Supabaseへの保存    │
                                                └─────────────────────────┘

┌─────────────────────┐    3. 質問               ┌─────────────────────────┐
│フロントエンド       │ ────────────────────────> │バックエンド             │
│(Next.js)           │                          │(LangGraph)              │
│ - SSEストリーム     │ <────────────────────────┤ - 検索グラフ            │
└─────────────────────┘    4. ストリーミング応答  │   + チャットモデル      │
                                                └─────────────────────────┘
```

### コンポーネント

- **バックエンド**: Node.js/TypeScript サービス

  - **取り込みグラフ** (`src/ingestion_graph.ts`) - ドキュメントのインデックス作成/取り込み
  - **検索グラフ** (`src/retrieval_graph.ts`) - 取り込まれたドキュメントに対する質問応答
  - **設定** (`src/shared/configuration.ts`) - モデルプロバイダーやベクトルストアの設定

- **フロントエンド**: Next.js/React アプリ
  - PDF アップロード機能
  - リアルタイムチャットインターフェース
  - ソース表示機能

### カスタマイズ

#### バックエンド

- `src/shared/configuration.ts`でデフォルト設定（ベクトルストア、k 値など）を変更できます
- `src/retrieval_graph/prompts.ts`でプロンプトを調整できます
- 検索モデルを変更するには、`src/shared/retrieval.ts`ファイルを編集します

#### フロントエンド

- `app/api/ingest`ルートでファイルアップロード制限を変更できます
- `_constants/graphConfigs.ts`でグラフ設定を変更できます

## トラブルシューティング

1. **.env が読み込まれない**

   - バックエンドとフロントエンドの両方で.env.example を.env にコピーしたことを確認
   - 環境変数が正しいことを確認し、開発サーバーを再起動

2. **OpenAI エラー**

   - `OPENAI_API_KEY`を確認。十分なクレジット/クォータがあることを確認

3. **LangGraph が実行されない**

   - `npm run dev`が失敗する場合は、Node バージョンが 18 以上であることを確認
   - すべての依存関係がインストールされていることを確認

4. **ネットワークエラー**
   - フロントエンドが正しい`NEXT_PUBLIC_LANGGRAPH_API_URL`を指していることを確認

## 参考資料

- [Learning LangChain (O'Reilly)](https://www.oreilly.com/library/view/learning-langchain/9781098167271/): LangChain と LangGraph を使用した AI と LLM アプリケーションの構築に関する書籍
- [LangChain 公式ドキュメント](https://js.langchain.com/docs/)
- [LangGraph 公式ドキュメント](https://langchain-ai.github.io/langgraph/)
- [Supabase ベクトルストアドキュメント](https://js.langchain.com/docs/integrations/vectorstores/supabase/)
- [mayooear/ai-pdf-chatbot-langchain](https://github.com/mayooear/ai-pdf-chatbot-langchain): 本プロジェクトの参考にしたオリジナルテンプレート

## ライセンス

MIT
