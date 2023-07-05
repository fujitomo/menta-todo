from typing import Optional

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
        db.client = AsyncIOMotorClient(
            host=env.MONGO_HOSTNAME,
            port=env.MONGO_PORT,
            username=env.MONGO_USERNAME,
            password=env.MONGO_PASSWORD,
        )

    @staticmethod
    async def close_connect():
        db.client.close()

    @staticmethod
    async def get_database() -> AsyncIOMotorClient:
        return db.client[env.MONGO_DB]
