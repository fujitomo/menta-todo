import logging
from contextlib import asynccontextmanager

from apis import routers
from constants import env
from constants.endpoints import Endpoints
from constants.other import DB_TYPE
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
from funcs import DbFuncs
from mangum import Mangum
from other.middleware import AccessHandlingMiddleware
from pydantic import BaseModel

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """アプリケーションのライフサイクル管理"""
    # 起動時
    await DbFuncs.start_connect()
    yield
    # シャットダウン時
    await DbFuncs.close_connect()


app = FastAPI(
    title="menta login",
    description="todo app",
    version="0.0.1",
    lifespan=lifespan,
)


@app.get("/")
async def root():
    """ブラウザで http://localhost:8100/ を開いたとき用（API は /docs を参照）"""
    return {
        "service": "menta-login-backend",
        "docs": "/docs",
        "health": Endpoints.General.health_check,
    }


app.include_router(routers)

# CORS設定: 環境変数から許可オリジンを取得
allowed_origins = []
if env.ALLOWED_ORIGINS:
    allowed_origins = [
        origin.strip() for origin in env.ALLOWED_ORIGINS.split(",") if origin.strip()
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # 環境変数で制御（空リストの場合はすべて拒否）
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "refreshtoken"],
    expose_headers=["newtoken"],  # クライアントに公開するヘッダー
)


base_auth = "/auth"

router = APIRouter()
openapi = get_openapi(
    title=app.title,
    version=app.version,
    description=app.description,
    routes=app.routes,
)


# トークン認証を行うエンドポイント共通のパラメーターを追加
# アクセストークンのヘッダー
# access_token = {
#     "required": True,
#     "schema": {"title": "Access-Token", "type": "string"},
#     "name": "access-token",
#     "in": "header",
# }

# リフレッシュトークンのヘッダー
refreshtoken = {
    "required": False,
    "schema": {"title": "refreshtoken", "type": "string"},
    "name": "refreshtoken",
    "in": "header",
}

# プライベートURLにリフレッシュトークンのヘッダーをつける(swagger)
openapi = {
    **openapi,
    "paths": {
        path: {
            # parametersにアクセストークンを追加
            crud_one: {
                k: v if k != "parameters" else v + [refreshtoken]
                for k, v in params.items()
            }
            if "parameters" in params
            # parametersがない場合、アクセストークンを単体で追加
            else {**params, "parameters": [refreshtoken]}
            for crud_one, params in crud.items()
        }
        if path in Endpoints.get_auth_required_endpoints()
        else crud
        for path, crud in openapi.get("paths", {}).items()
    },
}

app.openapi_schema = openapi


def custom_openapi():
    return app.openapi_schema


app.openapi = custom_openapi

app.add_middleware(AccessHandlingMiddleware)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """グローバル例外ハンドラー（HTTPException もここで JSON 化。ハンドラ内 raise は避ける）"""
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    # 本番環境では詳細なエラー情報を隠蔽
    if env.DEBUG_MODE:
        logger.exception("Unhandled exception occurred")
        return JSONResponse(
            status_code=500,
            content={
                "detail": f"内部サーバーエラーが発生しました: {str(exc)}",
            },
        )
    else:
        logger.error("Unhandled exception occurred: %s", type(exc).__name__)
        return JSONResponse(
            status_code=500,
            content={
                "detail": "内部サーバーエラーが発生しました",
            },
        )


if env.SERVER_LAMBDA:
    handler = Mangum(app)
