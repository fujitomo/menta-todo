
from apis import routers
from constants.endpoints import Endpoints
from fastapi import APIRouter, Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi_jwt_auth import AuthJWT
from funcs import DbFuncs
from other.middleware import AccessHandlingMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="menta login",
    description="todo app",
    version="0.0.1",
)
app.include_router(routers)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Settings(BaseModel):
    authjwt_secret_key: str = "secret"


@AuthJWT.load_config
def get_config():
    return Settings()


app.add_event_handler("startup", DbFuncs.start_connect)
app.add_event_handler("shutdown", DbFuncs.close_connect)


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
