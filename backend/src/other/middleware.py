from constants.endpoints import Endpoints
from constants.other import ERROR_MESSAGE
from fastapi import Request
from funcs.auth_funcs import AuthFuncs, TokenType
from funcs.exception_funcs import ExceptionFuncs
from starlette.middleware.base import BaseHTTPMiddleware
import logging
import json


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AccessHandlingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        BEARER_PREFIX = 'Bearer '
        access_token = request.headers.get('authorization', '')
        refresh_token = request.headers.get('refreshtoken')
        url_path = request.url.path
        # not access_tokenは恐らくOPTIONSリクエストで1回呼ばれるため、ここで処理を抜ける（詳細は要調査）
        if url_path not in Endpoints.get_auth_required_endpoints() or not access_token:
            return await call_next(request)

        access_token = access_token.replace(BEARER_PREFIX, '')
        token_info = ""
        new_token = None

        if url_path == Endpoints.Auth.email_authentication:
            token_info = AuthFuncs.check_token(access_token, TokenType.TMP.value)
            request.state.token_info = token_info
            return await call_next(request)

        token_info = AuthFuncs.check_token(access_token, TokenType.ACCESS.value)
        if not token_info and refresh_token:
            token_info = AuthFuncs.check_token(refresh_token, TokenType.REFRESH.value)
            if token_info:
                new_token = AuthFuncs.get_access_token(str(token_info.user_id))
            else:
                ExceptionFuncs.raise_unauthorized(ERROR_MESSAGE.TOKEN_EXPIRED)
        elif not token_info:
            ExceptionFuncs.raise_unauthorized(ERROR_MESSAGE.TOKEN_EXPIRED)

        request.state.token_info = token_info
        response = await call_next(request)

        if new_token:
            response.headers["newtoken"] = new_token.decode("utf-8")

        return response