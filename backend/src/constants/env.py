import os

from typing import Optional
from pydantic import BaseModel


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


env = EnvModel(**os.environ)
