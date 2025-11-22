# Menta Login Backend

このプロジェクトは、Menta Login アプリケーションのバックエンド API サーバーです。Python (FastAPI) と MongoDB を使用しています。

## 📋 目次

- [技術スタック](#-技術スタック)
- [環境構築](#-環境構築)
  - [前提条件](#前提条件)
  - [ローカル開発環境のセットアップ](#ローカル開発環境のセットアップ)
  - [Docker Compose を使用した開発](#docker-composeを使用した開発)
- [環境変数](#-環境変数)
- [ディレクトリ構成](#-ディレクトリ構成)
- [API ドキュメント](#-apiドキュメント)
- [デプロイ](#-デプロイ)

## 🛠 技術スタック

- **言語**: Python 3.8+
- **フレームワーク**: FastAPI
- **データベース**: MongoDB (本番環境: Amazon DocumentDB)
- **認証**: JWT (JSON Web Tokens)
- **メール送信**: AWS SES
- **インフラ**: Docker, AWS (Lambda, S3, CloudFront)

## 🚀 環境構築

### 前提条件

- Docker Desktop
- Python 3.8 以上
- AWS アカウント (メール送信、S3 使用時)

### ローカル開発環境のセットアップ

Docker を使用せずにローカルで Python を実行する場合の手順です。

1. **リポジトリのクローン**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **仮想環境の作成と有効化**

   ```bash
   python -m venv .venv

   # Windows
   .venv\Scripts\activate

   # macOS/Linux
   source .venv/bin/activate
   ```

3. **依存パッケージのインストール**

   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **環境変数の設定**
   `.env.sandbox`をコピーして環境変数を設定します（または直接環境変数をエクスポート）。

   ```bash
   # 開発用MongoDBがローカルで動いている必要があります
   # localhost:27017 でMongoDBを起動してください
   ```

5. **サーバーの起動**
   ```bash
   cd src
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Docker Compose を使用した開発

Docker Compose を使用すると、MongoDB も含めた完全な開発環境を簡単に構築できます。

1. **環境変数の設定**
   `backend/.env.sandbox`ファイルを作成・編集します。
   ※ `.env.sandbox.example` がある場合はコピーして使用してください。

2. **コンテナの起動**

   ```bash
   cd backend
   docker-compose -f docker-compose.dev.yaml up --build
   ```

   - API サーバー: http://localhost:8100
   - MongoDB: localhost:27017

3. **コンテナの停止**
   ```bash
   docker-compose -f docker-compose.dev.yaml down
   ```

## ⚙️ 環境変数

`.env.sandbox`ファイルで以下の設定を行います。

| 変数名           | 説明                                   | デフォルト値/例                           |
| ---------------- | -------------------------------------- | ----------------------------------------- |
| `SERVER_LAMBDA`  | AWS Lambda で実行するか                | `FALSE`                                   |
| `JWT_SECRET_KEY` | JWT トークン署名用キー                 | `SECRET` (本番は変更必須)                 |
| `DB_TYPE`        | DB の種類 (`MONGO_DB` / `DOCUMENT_DB`) | `MONGO_DB`                                |
| `MONGO_USERNAME` | DB ユーザー名                          | `mongo-user`                              |
| `MONGO_PASSWORD` | DB パスワード                          | `mongo-password`                          |
| `MONGO_HOSTNAME` | DB ホスト名                            | `mongo` (Docker 内), `localhost`          |
| `MONGO_PORT`     | DB ポート                              | `27017`                                   |
| `MONGO_DB`       | データベース名                         | `menta_login`                             |
| `SMTP_USERNAME`  | AWS SES SMTP ユーザー名                | SES で作成したユーザー名                  |
| `SMTP_PASSWORD`  | AWS SES SMTP パスワード                | SES で作成したパスワード                  |
| `AWSMAIL_HOST`   | SMTP サーバーホスト                    | `email-smtp.ap-northeast-1.amazonaws.com` |
| `FROM_EMAIL`     | 送信元メールアドレス                   | SES で検証済みのメールアドレス            |

## 📂 ディレクトリ構成

```
backend/
├── src/
│   ├── apis/           # APIエンドポイント定義
│   │   ├── auth/       # 認証関連API
│   │   └── todo/       # Todo関連API
│   ├── constants/      # 定数・環境変数・モデル定義
│   ├── funcs/          # 共通関数・ユーティリティ
│   │   ├── auth_funcs.py
│   │   ├── db_funcs.py
│   │   └── send_mail.py
│   ├── other/          # ミドルウェアなど
│   ├── main.py         # アプリケーションエントリーポイント
│   └── app.py          # FastAPIアプリ設定
├── Dockerfile          # 本番用Dockerfile
├── Dockerfile.dev      # 開発用Dockerfile
├── docker-compose.yaml # 本番用Compose設定
├── docker-compose.dev.yaml # 開発用Compose設定
└── requirements.txt    # Python依存パッケージ
```

## 📖 API ドキュメント

サーバー起動後、以下の URL で Swagger UI にアクセスできます。

- **Swagger UI**: http://localhost:8100/docs
- **ReDoc**: http://localhost:8100/redoc

## 🚢 デプロイ

### AWS Lambda へのデプロイ

このプロジェクトは `mangum` を使用して AWS Lambda で実行できるように構成されています。

1. `Dockerfile.serverless` を使用して Docker イメージをビルド
2. AWS ECR にイメージをプッシュ
3. AWS Lambda 関数を作成し、ECR イメージを指定
4. 環境変数 `SERVER_LAMBDA=TRUE` を設定

### MongoDB 接続

本番環境では Amazon DocumentDB の使用を推奨します。

- `DB_TYPE=DOCUMENT_DB` に設定
- `CLUSTER_ENDPOINT` にエンドポイントを設定
- `SSL_CERT_PATH` に証明書パスを指定

## 🔍 トラブルシューティング

### メールが届かない場合

- AWS SES で「送信元メールアドレス」と「送信先メールアドレス（サンドボックス環境の場合）」が検証済みか確認してください。
- `.env.sandbox`の`SMTP_USERNAME`と`SMTP_PASSWORD`が正しいか確認してください（IAM のアクセスキーとは異なります）。

### MongoDB に接続できない場合

- コンテナ内からはホスト名 `mongo` を使用します。
- ホストマシン（Windows/Mac）から接続する場合は `localhost:27017` を使用します。
- URI 例: `mongodb://mongo-user:mongo-password@localhost:27017/menta_login?authSource=admin`
