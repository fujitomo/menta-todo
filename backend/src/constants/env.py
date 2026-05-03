import os
from pathlib import Path
from typing import Optional, Tuple

from pydantic import BaseModel, Field


def _parse_env_line(line: str) -> Optional[Tuple[str, str]]:
    line = line.strip()
    if not line or line.startswith("#"):
        return None
    if "=" not in line:
        return None
    key, _, value = line.partition("=")
    key = key.strip()
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        value = value[1:-1]
    if not key:
        return None
    return key, value


def _load_env_file(path: Path, *, only_if_missing: bool) -> None:
    """KEY=VALUE 形式の .env 系ファイルを os.environ に取り込む。"""
    if not path.is_file():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        parsed = _parse_env_line(raw)
        if not parsed:
            continue
        key, value = parsed
        if only_if_missing and key in os.environ:
            continue
        os.environ[key] = value


def _load_local_env_files() -> None:
    """backend/.env.sandbox → .env.sandbox.local（後者で上書き）を読み込む。"""
    # backend/src/constants/env.py → parents[2] == backend/
    backend_dir = Path(__file__).resolve().parents[2]
    _load_env_file(backend_dir / ".env.sandbox", only_if_missing=True)
    _load_env_file(backend_dir / ".env.sandbox.local", only_if_missing=False)


_load_local_env_files()


class EnvModel(BaseModel):
    SERVER_LAMBDA: str = "FALSE"
    DB_TYPE: str
    JWT_SECRET_KEY: str
    MONGO_USERNAME: str
    MONGO_PASSWORD: str
    MONGO_HOSTNAME: str
    MONGO_PORT: int
    MONGO_DB: str
    IAM_USERNAME: Optional[str] = ""
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    USER_NAME: Optional[str] = ""
    PASSWORD: Optional[str] = ""
    ACCESS_KEY_ID: str
    SECRET_ACCESS_KEY: str
    CONSOLE_LOGIN_LINK: Optional[str] = ""
    FROM_NAME: str
    FROM_EMAIL: str
    S3_BUCKET_NAME: str
    AWS_CLOUDFRONT_URL: str
    AWS_REGION_NAME: str
    AWS_CLOUDFRONT_KEY: str
    AWS_CLOUDFRONT_PEM: str
    SSL_CERT_PATH: Optional[str] = ""
    CLUSTER_ENDPOINT: Optional[str] = ""
    AWSMAIL_HOST: str
    ALLOWED_ORIGINS: Optional[str] = ""
    DEBUG_MODE: bool = False


env = EnvModel(**os.environ)
