# PDF チャットボットエージェント - バックエンド

このディレクトリには、PDF チャットボットアプリケーションの LangGraph バックエンドが含まれています。PDF ドキュメントの処理（インジェスト）と質問応答の両方を処理するための状態グラフワークフローを提供します。

## 技術スタック

- **Node.js**:
- **TypeScript**:
- **LangGraph**:
- **LangChain**:
- **OpenAI API**:

## ディレクトリ構造

```
backend/
├── src/
│   ├── ingestion_graph/        # PDFインジェクション処理グラフ
│   │   ├── configuration.ts    # インジェスト設定
│   │   ├── graph.ts            # インジェストグラフの定義
│   │   └── state.ts            # 状態定義
│   ├── retrieval_graph/        # 検索・質問応答グラフ
│   │   ├── configuration.ts    # 検索固有の設定
│   │   ├── graph.ts            # 検索グラフの定義
│   │   ├── prompts.ts          # LLMプロンプトテンプレート
│   │   ├── state.ts            # 状態定義
│   │   └── utils.ts            # ユーティリティ関数
│   ├── shared/                 # 共有コンポーネント
│   │   ├── configuration.ts    # グローバル設定
│   │   ├── retrieval.ts        # ベクトル検索機能
│   │   ├── state.ts            # 共有状態定義
│   │   └── utils.ts            # ユーティリティ関数
│   ├── sample_docs.json        # サンプルドキュメントデータ
│   └── tsconfig.json           # TypeScript設定
├── .env                        # 環境変数（gitignoreに含める）
├── langgraph.json              # LangGraph設定
├── package.json                # 依存関係
└── package-lock.json           # 依存関係のロックファイル
```

## 主要コンポーネント

バックエンドは主に 2 つの LangGraph ワークフローで構成されています：

### インジェクショングラフ

PDF ドキュメントの取り込みと処理を担当します：

1. PDF からのテキスト抽出
2. テキストのチャンク化（適切なサイズに分割）
3. 埋め込みベクトルの生成
4. ベクトルストアへの保存

このグラフは`src/ingestion_graph/graph.ts`で定義されています。

### 検索グラフ

ユーザーの質問に対する回答を担当します：

1. クエリタイプの分析（検索が必要か直接回答か）
2. 必要に応じた関連ドキュメントの検索
3. 検索されたコンテキストを使用した回答の生成
4. ユーザーへの回答のストリーミング

このグラフは`src/retrieval_graph/graph.ts`で定義されています。

## 環境変数

`.env`ファイルを作成し、以下の変数を設定してください：

```
OPENAI_API_KEY=your-openai-api-key-here
SUPABASE_URL=your-supabase-url-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT="pdf-chatbot"
```

### 環境変数の説明

- `OPENAI_API_KEY`: OpenAI API キー（または他の LLM プロバイダーのキー）
- `SUPABASE_URL`: Supabase プロジェクトの URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase のサービスロールキー
- `LANGCHAIN_TRACING_V2`: LangSmith トレーシングを有効にする（オプション）
- `LANGCHAIN_PROJECT`: LangSmith プロジェクト名（オプション）

## インストールと実行

```bash
# 依存関係のインストール
npm install

# 開発モードで実行
npx @langchain/langgraph-cli dev
```

これにより、デフォルトでポート 2024 に LangGraph サーバーが起動します。また、LangGraph Studio UI が自動的に開き、グラフの可視化、テスト、デバッグが可能になります。

## LangGraph Studio UI

開発モードでサーバーを起動すると、LangGraph Studio UI にリダイレクトされます。この UI では以下のことができます：

- グラフのワークフローを視覚的に確認
- 各ノードの入出力をテスト
- 実行トレースの詳細を確認
- グラフの動作をリアルタイムでデバッグ

## 参考資料

- [LangChain ドキュメント](https://js.langchain.com/docs/)
- [LangGraph ドキュメント](https://langchain-ai.github.io/langgraph/)
- [OpenAI API リファレンス](https://platform.openai.com/docs/api-reference)
- [Supabase Vector ドキュメント](https://supabase.com/docs/guides/ai/vector-columns)
- [Embeddings Explained](https://js.langchain.com/docs/modules/data_connection/embeddings/)
