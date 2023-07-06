
import traceback
from enum import Enum

import jwt
from constants import env
from constants.endpoints import Endpoints
from constants.other import ERROR_MESSAGE
from fastapi import Request
from funcs import ExceptionFuncs
from funcs.exception_funcs import ExceptionFuncs
from pydantic import BaseModel
from starlette.middleware.base import BaseHTTPMiddleware


class TokenType(Enum):
    ACCESS = "access_token"
    TMP = "tmp_token"
    REFRESH = "refresh_token"


class TokenPayload(BaseModel):
    user_id: str
    exp: int
    type: str


class AccessHandlingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        print(f'headers: {request.headers}')

        access_token = request.headers.get('access_token')

        print(access_token)
        url_path = request.url.path

        if url_path not in Endpoints.get_auth_required_endpoints():
            # トークンチェックが不要なエンドポイントは処理を抜ける
            return await call_next(request)

        url_path = request.url.path
        new_token = None
        token_info = ""
        token_info = self.check_token(access_token)

        if not token_info:
            # トークンが無効であれば、リフレッシュする
            # refresh_token = request.headers.get('refresh-token')
            # if not refresh_token:
            #     ExceptionFuncs.raise_unauthorized(ERROR_MESSAGE.TOKEN_EXPIRED)

            # token_info = AuthFuncs.check_token(refresh_token)
            if token_info:
                token_info = ""
                # new_token = AuthFuncs.get_access_token(token_info.user_id)
            # else:
            #     ExceptionFuncs.raise_unauthorized(ERROR_MESSAGE.TOKEN_EXPIRED)

        # request.state.token_info = token_info

        response = await call_next(request)

        if new_token:
            response.headers["access-token"] = new_token
        print(f'end: {request.headers}')
        return response

    def check_token(token):
        # payload = jwt.decode(
        #     token,
        #     str(env.JWT_SECRET_KEY),
        #     algorithms=["HS256"],
        # )
        return ""
