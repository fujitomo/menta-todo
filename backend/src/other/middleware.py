

from constants.endpoints import Endpoints
from constants.other import ERROR_MESSAGE
from fastapi import Request
from funcs import ExceptionFuncs
from funcs.auth_funcs import AuthFuncs, TokenType
from funcs.exception_funcs import ExceptionFuncs
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
class AccessHandlingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request,  call_next):
        print(f'headers: {request.headers}')

        access_token = request.headers.get('authorization')

        url_path = request.url.path

        if url_path not in Endpoints.get_auth_required_endpoints():
            # トークンチェックが不要なエンドポイントは処理を抜ける
            return await call_next(request)

        if url_path == Endpoints.Auth.email_authentication:
            token_info = AuthFuncs.check_token(access_token, TokenType.TMP.value)
            return await call_next(request)

        # 恐らくOPTIONSリクエストで1回呼ばれるため、ここで処理を抜ける（詳細は要調査）
        if not access_token:
            return await call_next(request)

        url_path = request.url.path
        new_token = None
        token_info = ""
        access_token = access_token.replace('Bearer ', '')
        token_info = AuthFuncs.check_token(access_token, TokenType.ACCESS.value)

        if not token_info:
            # トークンが無効であれば、リフレッシュする
            refresh_token = request.headers.get('refreshtoken')
            if not refresh_token:
                ExceptionFuncs.raise_unauthorized(ERROR_MESSAGE.TOKEN_EXPIRED)

            token_info = AuthFuncs.check_token(refresh_token, TokenType.REFRESH.value)
            if token_info:
                new_token = AuthFuncs.get_access_token(str(token_info.user_id))
            else:
                ExceptionFuncs.raise_unauthorized(ERROR_MESSAGE.TOKEN_EXPIRED)

        request.state.token_info = token_info
        response = await call_next(request)

        # アクセストークンの有効期限が切れていた場合には、新しいアクセストークンを返す
        if new_token:
            print("TEST")
            response.headers["newtoken"] = new_token.decode("utf-8")
            print(response.headers)

        return response
