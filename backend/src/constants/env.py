import os

from pydantic import BaseModel


class EnvModel(BaseModel):
    JWT_SECRET_KEY: str
    MONGO_USERNAME: str
    MONGO_PASSWORD: str
    MONGO_HOSTNAME: str
    MONGO_PORT: int
    MONGO_DB: str
    IAM_USERNAME: str
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    USER_NAME: str
    PASSWORD: str
    ACCESS_KEY_ID: str
    SECRET_ACCESS_KEY: str
    CONSOLE_LOGIN_LINK: str
    FROM_NAME: str
    FROM_EMAIL: str
    S3_BUCKET_NAME: str
    AWS_CLOUDFRONT_URL: str
    AWS_REGION_NAME: str
    AWS_CLOUDFRONT_KEY: str
    AWS_CLOUDFRONT_PEM: str


env = EnvModel(**os.environ)
