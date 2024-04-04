from typing import Optional

from constants.other import DB_TYPE
from constants import env
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel


class User(BaseModel):
    user_id: Optional[str]


class UtilsMongoDB:
    client: AsyncIOMotorClient = None

db = UtilsMongoDB()

class DbFuncs:
    @staticmethod
    async def start_connect():
        if env.DB_TYPE == DB_TYPE.MONGO_DB:
            db.client = AsyncIOMotorClient(
                host=env.MONGO_HOSTNAME,
                port=env.MONGO_PORT,
                username=env.MONGO_USERNAME,
                password=env.MONGO_PASSWORD,
            )
        elif env.DB_TYPE == DB_TYPE.DOCUMENT_DB:
            # Amazon DocumentDBの接続情報
            username=env.MONGO_USERNAME
            password=env.MONGO_PASSWORD
            cluster_endpoint=env.CLUSTER_ENDPOINT
            port=env.MONGO_PORT

            # SSL証明書のパス
            ssl_cert_path = "/var/task/funcs/global-bundle.pem"

            # MongoClientのインスタンスを作成
            db.client = AsyncIOMotorClient(
                f"mongodb://{username}:{password}@{cluster_endpoint}:{port}/?tls=true&tlsCAFile={ssl_cert_path}&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false"
            )

    @staticmethod
    async def close_connect():
        db.client.close()

    @staticmethod
    async def get_database() -> AsyncIOMotorClient:
        return db.client[env.MONGO_DB]
