import datetime
import hashlib
import random
import re
import string
import traceback
from enum import Enum
from typing import Any

import jwt
from constants import env
from constants.other import ERROR_MESSAGE, REGISTRANT
from pydantic import BaseModel

from .exception_funcs import ExceptionFuncs
from jwt.exceptions import DecodeError


class TokenType(Enum):
    ACCESS = "access_token"
    TMP = "tmp_token"
    REFRESH = "refresh_token"


class TokenPayload(BaseModel):
    user_id: str
    exp: int
    type: str


class AuthFuncs:

    @staticmethod
    def check_token(token, expected_type) -> TokenPayload:
        try:
            payload = jwt.decode(
                token,
                str(env.JWT_SECRET_KEY),
                algorithms=["HS256"],
            )

            # トークンのtypeをチェック
            if payload["type"] != expected_type:
                ExceptionFuncs.raise_unauthorized(ERROR_MESSAGE.TOKEN_AUTHORITY)

            return TokenPayload(**payload)
        except (jwt.ExpiredSignatureError, ValueError, DecodeError):
            return None
        except Exception:
            print("エラー:" + traceback.format_exc())
            ExceptionFuncs.raise_unauthorized(ERROR_MESSAGE.TOKEN_AUTHORITY)

    @staticmethod
    def create_token(payload: TokenPayload) -> str:
        return jwt.encode(
            payload.dict(),
            env.JWT_SECRET_KEY,
            algorithm="HS256",
        )

    @staticmethod
    def create_hash(value: str) -> str:
        return hashlib.md5(value.encode('utf-8')).hexdigest()

    @staticmethod
    def random_name(num: int) -> str:
        randlst = [
            random.choice(string.ascii_letters + string.digits)
            for _ in range(num)
        ]
        return "".join(randlst)

    @staticmethod
    async def email_exists(collection: Any, email: str, is_authnticated: bool):
        return await collection.find_one(
            {"$and": [{REGISTRANT.EMAIL: email},
                      {REGISTRANT.IS_AUTHENTICATED: is_authnticated}]})

    @staticmethod
    def get_access_token(user_id: str) -> str:
        payload = TokenPayload(user_id=user_id,
                               type=TokenType.ACCESS.value,
                               exp=int((datetime.datetime.utcnow() + datetime.timedelta(hours=+1)).timestamp()))
        return AuthFuncs.create_token(payload)

    @staticmethod
    def get_refresh_token(user_id: str) -> str:
        payload = TokenPayload(user_id=user_id,
                               type=TokenType.REFRESH.value,
                               exp=int((datetime.datetime.utcnow() + datetime.timedelta(days=+90)).timestamp()))
        return AuthFuncs.create_token(payload)

    # complieすると処理が速い
    repatter_email = re.compile(
        r"^[a-zA-Z0-9_+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

    @staticmethod
    def is_email_format(email: str):
        return AuthFuncs.repatter_email.match(email)

    @staticmethod
    def is_password_format(password: str):
        return len(password) >= 8 and len(password) <= 25

    @staticmethod
    async def get_avatar_photo_hash(collection: Any, usrId: str) -> str:
        profile = await collection.find_one(
            {REGISTRANT.USER_ID: usrId})
        db_hs = profile[REGISTRANT.AVATAR_PHOTO_HASH]
        return str(db_hs)

    @staticmethod
    def get_next_number_genration(number_genration: str) -> str:
        if number_genration[0:8] != AuthFuncs.get_new_number()[0:8]:
            result = AuthFuncs.get_new_number()
        else:
            today = datetime.date.today()
            # 処理日の4桁表示
            today_md = today.strftime("%m%d")

            if int(number_genration[8:9]) + 1 > int(REGISTRANT.MAX_NUMBER_GENRATION) and today_md == number_genration[4:8]:
                ExceptionFuncs.raise_unauthorized(ERROR_MESSAGE.ONEPASSWORD_GENERATION)
            num = number_genration[8:9]
            result = number_genration[0:8] + str(int(num) + 1)
        return result

    @staticmethod
    def get_next_number_verification(number_verification: str) -> str:
        if number_verification[0:8] != AuthFuncs.get_new_number()[0:8]:
            return AuthFuncs.get_new_number()

        print(int(number_verification[4:8]))
        if int(number_verification[8:9]) + 1 > int(REGISTRANT.MAX_NUMBER_VERIFICATION):
            ExceptionFuncs.raise_unauthorized(ERROR_MESSAGE.ONEPASSWORD_INSPECTION)
        num = number_verification[8:9]
        return number_verification[0:8] + str(int(num) + 1)

    @staticmethod
    def get_new_number():
        now = datetime.datetime.now()
        return f"{now:%Y%m%d}1"
