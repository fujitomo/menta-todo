import os

from pydantic import BaseModel


class EnvModel(BaseModel):
    JWT_SECRET_KEY: str
    MONGO_USERNAME: str
    MONGO_PASSWORD: str
    MONGO_HOSTNAME: str
    MONGO_PORT: int
    MONGO_DB: str


env = EnvModel(**os.environ)
