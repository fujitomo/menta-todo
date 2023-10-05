

from constants.endpoints import Endpoints
from constants.other import ERROR_MESSAGE
from fastapi import Request
from funcs import ExceptionFuncs
from funcs.auth_funcs import AuthFuncs
from funcs.exception_funcs import ExceptionFuncs
from starlette.middleware.base import BaseHTTPMiddleware


class AccessHandlingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        print(f'headers: {request.headers}')

        access_token = request.headers.get('authorization')

        print(f'token: {access_token}')

        url_path = request.url.path

        if url_path not in Endpoints.get_auth_required_endpoints():
            # トークンチェックが不要なエンドポイントは処理を抜ける
            return await call_next(request)

        # 恐らくOPTIONSリクエストで1回呼ばれるため、ここで処理を抜ける（詳細は要調査）
        if not access_token:
            return await call_next(request)

        url_path = request.url.path
        new_token = None
        token_info = ""

        access_token = access_token.replace('Bearer ', '')
        token_info = AuthFuncs.check_token(access_token)

        if not token_info:
            # トークンが無効であれば、リフレッシュする
            refresh_token = request.headers.get('refresh-token')
            if not refresh_token:
                ExceptionFuncs.raise_unauthorized(ERROR_MESSAGE.TOKEN_EXPIRED)

            token_info = AuthFuncs.check_token(refresh_token)
            if token_info:
                token_info = ""
                new_token = AuthFuncs.get_access_token(token_info.user_id)
            else:
                ExceptionFuncs.raise_unauthorized(ERROR_MESSAGE.TOKEN_EXPIRED)

        print("token_info:" + str(token_info))
        request.state.token_info = token_info

        response = await call_next(request)

        if new_token:
            response.headers["access-token"] = new_token
        print(f'end: {request.headers}')
        return response
