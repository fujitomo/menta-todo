# menta-todo

## 概要

menta-todo は、学習用に構築されたフルスタックな TODO 管理システムです。FastAPI を中心にしたバックエンドと Next.js/TypeScript のフロントエンドを連携させ、ユーザー登録、ワンタイムパスワードによるメール認証、プロフィール管理、Todo の作成・検索・添付ファイル管理までを一貫して体験できます。

### 主な機能

- E メールとワンタイムパスワードによる新規登録フロー（AWS SES 経由で通知）
- JWT アクセストークン／リフレッシュトークンとヘッダー自動更新による認証基盤
- プロフィール編集（アイコン画像を S3 + CloudFront に保存、署名付き URL で配信）
- Todo の CRUD、タグ・状態・添付ファイル有無などの複合検索、色分け表示
- Recoil / React Query / MUI ベースの SPA ライクな UI と通知ダイアログ
- AWS Lambda（Mangum）や Docker を使った複数のデプロイオプション

## 技術スタック

### フロントエンド

- Next.js 13 (React 18, TypeScript)
- Material UI, @emotion, styled-components, Tailwind CSS
- React Hook Form, React Query, Recoil, dayjs, axios, js-cookie

### バックエンド

- Python 3.8, FastAPI, Uvicorn
- fastapi-jwt-auth, Pydantic, Motor (MongoDB/DocumentDB クライアント)
- boto3, Pillow, python-multipart, Mangum（AWS Lambda 対応）
- 独自ミドルウェアでの JWT 検証とアクセストークン自動再発行

### データベース

- MongoDB 5.x 互換（ローカル Mongo または Amazon DocumentDB）
- コレクション：`registrant`（利用者・認証情報）、`todo`（Todo 本体）

### インフラ / デプロイ

- Docker / Docker Compose（開発・本番用）
- AWS S3 + CloudFront（添付ファイルとプロフィール画像の配信）
- AWS SES (SMTP) によるメール送信
- Nginx リバースプロキシ（`custom_proxy_settings.conf` で 20MB までアップロード許可）
- AWS Lambda コンテナイメージ（`Dockerfile.serverless`）

## セットアップ

### 前提条件

- Node.js 18 LTS 以上（Next.js 13 推奨環境）
- npm または yarn
- Python 3.8 系（仮想環境推奨）
- pip / venv（または Poetry 等）
- MongoDB 5.x 互換インスタンス、または Amazon DocumentDB
- （任意）Docker Desktop と Docker Compose v2
- AWS アカウント（S3 / CloudFront / SES / IAM を使用する場合）

### リポジトリの取得

```bash
git clone <repository-url> menta-todo
cd menta-todo
```

### 環境変数の設定

#### バックエンド（`backend/.env` など）

FastAPI アプリは環境変数をすべて必須として読み込みます。`.env` ファイルを作成し、Docker では `env_file`（例: `.env.sandbox`）経由で読み込ませてください。

| 変数名                                | 必須 | 説明                                                                                     |
| ------------------------------------- | ---- | ---------------------------------------------------------------------------------------- |
| `SERVER_LAMBDA`                       | 任意 | `true` の場合は AWS Lambda (Mangum) ハンドラーを公開。ローカル開発では空 or `false`。    |
| `DB_TYPE`                             | 必須 | `MONGO_DB`（ローカル MongoDB）または `DOCUMENT_DB`（Amazon DocumentDB）。                |
| `JWT_SECRET_KEY`                      | 必須 | JWT 署名キー。アクセストークン・リフレッシュトークンの発行で使用。                       |
| `MONGO_USERNAME`                      | 必須 | MongoDB / DocumentDB のユーザー名。Docker 開発 compose では `mongo-user`。               |
| `MONGO_PASSWORD`                      | 必須 | MongoDB / DocumentDB のパスワード。                                                      |
| `MONGO_HOSTNAME`                      | 必須 | MongoDB ホスト名（例: `localhost` や `mongo`）。                                         |
| `MONGO_PORT`                          | 必須 | MongoDB ポート番号（例: `27017`）。                                                      |
| `MONGO_DB`                            | 必須 | 使用するデータベース名（例: `menta_todo`）。                                             |
| `IAM_USERNAME`                        | 任意 | [TODO: 使用箇所を要確認]。                                                               |
| `SMTP_USERNAME` / `SMTP_PASSWORD`     | 必須 | AWS SES 等の SMTP 資格情報。メール送信用。                                               |
| `USER_NAME` / `PASSWORD`              | 任意 | [TODO: 目的の確認が必要]。                                                               |
| `ACCESS_KEY_ID` / `SECRET_ACCESS_KEY` | 必須 | S3 など AWS SDK 用のアクセスキー。                                                       |
| `CONSOLE_LOGIN_LINK`                  | 任意 | [TODO: メールテンプレート等での利用有無を確認]。                                         |
| `FROM_NAME` / `FROM_EMAIL`            | 必須 | 送信メールの表示名・メールアドレス。                                                     |
| `S3_BUCKET_NAME`                      | 必須 | 添付ファイル・プロフィール画像の保存先バケット。                                         |
| `AWS_CLOUDFRONT_URL`                  | 必須 | 署名付き URL の配信元 CloudFront ドメイン。                                              |
| `AWS_REGION_NAME`                     | 必須 | 使用する AWS リージョン（例: `ap-northeast-1`）。                                        |
| `AWS_CLOUDFRONT_KEY`                  | 必須 | CloudFront キーペア ID。                                                                 |
| `AWS_CLOUDFRONT_PEM`                  | 必須 | CloudFront 秘密鍵ファイル（`.pem`）への絶対パス。Docker 実行時は `/src/funcs/...` など。 |
| `SSL_CERT_PATH`                       | 任意 | [TODO: DocumentDB の証明書パスとして利用するか確認]。                                    |
| `CLUSTER_ENDPOINT`                    | 任意 | DocumentDB を使う場合の接続エンドポイント。                                              |

> ⚠️ 未使用と思われる変数については `[TODO]` として用途の確認を残しています。整理する際は動作確認と合わせて実装の見直しを行ってください。

#### フロントエンド（`frontend/.env.local`）

| 変数名                | 必須 | 説明                                                                         |
| --------------------- | ---- | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APIROOT` | 必須 | フロントから参照する API ベース URL。開発時は `http://localhost:8000` など。 |
| `HOGE`                | 任意 | `next.config.js` のプレースホルダー。未使用のため必要に応じて削除可。        |

##### 例: 開発用 `.env`（抜粋）

```bash
# backend/.env
SERVER_LAMBDA=false
DB_TYPE=MONGO_DB
MONGO_HOSTNAME=localhost
MONGO_PORT=27017
MONGO_DB=menta_todo
MONGO_USERNAME=mongo-user
MONGO_PASSWORD=mongo-password
JWT_SECRET_KEY=change-me
SMTP_USERNAME=your-ses-user
SMTP_PASSWORD=your-ses-password
FROM_NAME="menta todo"
FROM_EMAIL=no-reply@example.com
S3_BUCKET_NAME=your-bucket
AWS_CLOUDFRONT_URL=dxxxxxxxx.cloudfront.net
AWS_REGION_NAME=ap-northeast-1
AWS_CLOUDFRONT_KEY=APKAXXXXXXXX
AWS_CLOUDFRONT_PEM="/src/funcs/pk-APKAXXXXX.pem"
ACCESS_KEY_ID=AKIA...
SECRET_ACCESS_KEY=...

# frontend/.env.local
NEXT_PUBLIC_APIROOT=http://localhost:8000
```

### ローカル環境の構築

#### バックエンド (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate    # macOS/Linux
pip install --upgrade pip
pip install -r requirements.txt

# アプリ起動（backend/src 下で実行）
cd src
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- `PYTHONPATH=src` を設定するか、`backend/src` ディレクトリで起動してください。
- MongoDB が起動していること、環境変数が読み込まれていることを確認します。

#### フロントエンド (Next.js)

```bash
cd frontend
npm install
npm run dev
```

- 開発サーバー: http://localhost:3000
- `NEXT_PUBLIC_APIROOT` がバックエンド URL と一致している必要があります。

#### Docker Compose を使う場合

- 開発用: `docker compose -f backend/docker-compose.dev.yaml up --build`
  - `menta_login` サービスが FastAPI を 8100 ポートで公開します。
  - MongoDB (ユーザー: `mongo-user` / パスワード: `mongo-password`) が同時に立ち上がります。
- 本番想定: `docker compose -f backend/docker-compose.yaml up --build -d`
  - Nginx リバースプロキシが起動し、`custom_proxy_settings.conf` で 20MB のアップロード制限を設定しています。
  - `.env.sandbox` をベースに本番値へ差し替えてください。

#### データベースの初期化

- Docker 開発構成では MongoDB に root ユーザーが作成されます。`mongo` シェルからアプリ用ユーザーを作成するか、既定の root 資格情報を `.env` に設定してください。
- 使用するコレクション（`registrant`, `todo`）はアプリ実行時に自動作成されます。

#### CloudFront 署名付き URL の準備

1. AWS コンソールの「セキュリティ認証情報」から CloudFront キーペアを作成し、秘密鍵 (`pk-XXXXXXXX.pem`) と公開鍵を取得。
2. 取得した秘密鍵ファイルを `backend/src/funcs/` などコンテナから参照できる場所へ配置し、`AWS_CLOUDFRONT_PEM` にフルパスをセット。
3. CloudFront の「パブリックキー」で公開鍵を登録し、キーグループを作成。
4. 対象ディストリビューションのビヘイビア設定で「ビューワーアクセスを制限」を有効化し、作成したキーグループを紐付けます。

#### Amazon DocumentDB を使う場合

- セキュリティグループの例:
  - インバウンド: TCP/27017 を 0.0.0.0/0（必要に応じて絞り込み）
  - アウトバウンド: すべて許可
- `DB_TYPE=DOCUMENT_DB` に設定し、`CLUSTER_ENDPOINT` や証明書パス（必要であれば `SSL_CERT_PATH`）を適切に指定してください。

## 実行方法

### 開発モード

- バックエンド: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
- フロントエンド: `npm run dev`
- Docker Compose 開発: `docker compose -f backend/docker-compose.dev.yaml up --build`

### 本番ビルド / デプロイ

- フロントエンド: `npm run build && npm run start`
- バックエンド (スタンドアロン): `uvicorn main:app --host 0.0.0.0 --port 8000`
- Docker (本番想定): `docker compose -f backend/docker-compose.yaml up --build -d`
- AWS Lambda: `Dockerfile.serverless` でコンテナイメージをビルドし、`main.handler` をエントリポイントとしてデプロイ（`SERVER_LAMBDA=true` を設定）。

## プロジェクト構造

```
.
├─ backend/
│  ├─ Dockerfile, Dockerfile.dev, Dockerfile.serverless
│  ├─ docker-compose(.dev).yaml
│  └─ src/
│     ├─ main.py                # FastAPI エントリポイント
│     ├─ apis/                  # 認証・Todo エンドポイント
│     ├─ constants/             # エンドポイント定義・モデル・環境変数
│     ├─ funcs/                 # 認証・DB・ファイルアップロードなどのドメインロジック
│     └─ other/middleware.py    # JWT 検証ミドルウェア
└─ frontend/
   ├─ package.json, next.config.js
   └─ src/
      ├─ pages/                 # Next.js ページ（Login, Profile, Todo 一覧など）
      ├─ components/            # ダイアログ、フォーム、レイアウト
      ├─ hooks/                 # API 呼び出し、Recoil 同期、UI ロジック
      ├─ recoilAtoms/           # グローバルステート定義
      └─ utils/                 # axios サービス、ユーティリティ
```

## API エンドポイント

共通仕様:

- 認証が必要なエンドポイントでは `Authorization: Bearer <token>` と `refreshtoken` ヘッダーを送信します。
- 有効なリフレッシュトークンがある場合、レスポンスヘッダー `newtoken` に新しいアクセストークンが返ります。
- ファイル添付を伴うリクエストは `multipart/form-data` で送信します。

| カテゴリ | メソッド | パス                                | 内容                                                      | 認証                       |
| -------- | -------- | ----------------------------------- | --------------------------------------------------------- | -------------------------- |
| General  | GET      | `/general/health-check`             | API のヘルスチェック                                      | 要 (Bearer 任意文字列で可) |
| Auth     | POST     | `/auth/login`                       | ログイン。アクセストークン／リフレッシュトークンを返却    | 不要                       |
| Auth     | POST     | `/auth/create_account`              | 新規アカウント登録 + ワンタイムパスワード送信             | 不要                       |
| Auth     | POST     | `/auth/email_authentication`        | ワンタイムパスワード検証。恒久トークンを発行              | 要 (TMP トークン)          |
| Auth     | POST     | `/auth/update_email`                | メールアドレス変更リクエスト。OTP 再送                    | 要                         |
| Auth     | POST     | `/auth/update_email_authentication` | メール変更の OTP 検証                                     | 要                         |
| Auth     | POST     | `/auth/create_profile`              | プロフィール初期登録（画像アップロード可）                | 要                         |
| Auth     | POST     | `/auth/update_profile`              | プロフィール更新（画像ハッシュチェック付き）              | 要                         |
| Auth     | GET      | `/auth/get_profile`                 | プロフィール取得（署名付き URL 生成）                     | 要                         |
| Auth     | POST     | `/auth/update_password`             | パスワード更新（旧パスワード検証）                        | 要                         |
| Todo     | POST     | `/todo/create_todo`                 | Todo 作成（複数ファイルアップロード、バリデーションあり） | 要                         |
| Todo     | POST     | `/todo/update_todo`                 | Todo 更新（完了時の完了日自動設定、添付差し替え）         | 要                         |
| Todo     | DELETE   | `/todo/delete_todo?todo_id=...`     | Todo 論理削除 + S3 オブジェクト削除                       | 要                         |
| Todo     | POST     | `/todo/get_todo`                    | 単一 Todo の取得（添付は署名付き URL 化）                 | 要                         |
| Todo     | POST     | `/todo/get_todolist`                | 条件検索（タイトル／タグ／日付／状態など）                | 要                         |

## テスト

- 現時点で自動テストは実装されていません。
- [TODO: FastAPI と Next.js のテスト戦略（例: pytest, React Testing Library, Playwright）を設計しドキュメント化]

## 貢献ガイド

- Git フロー例: `main` (本番) / `develop` (開発) / `feature/<summary>` ブランチで作業。
- 変更前に最新の `develop` を取り込み、機能ごとに小さな PR を作成してください。
- コミットメッセージは動詞から始めた英語句を推奨（例: `feat: add todo search filter`）。
- フロントエンド: `npm run lint`、バックエンド: `pip install -r requirements.txt` 後に `uvicorn --check` 等で動作確認。
- PR には動作確認手順、必要な環境変数、スクリーンショット（UI 変更時）を添付してください。
- セキュリティ情報（秘密鍵・パスワード）は含めないでください。

## ライセンス

[TODO: ライセンス情報を追記]
