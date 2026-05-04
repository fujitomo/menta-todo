from constants import BasicResponses, Endpoints, Tags
from constants.models import MultiPartModel
from constants.other import COLLLECTION, ERROR_MESSAGE, REGISTRANT
from fastapi import APIRouter, Depends
from funcs import AuthFuncs, DbFuncs, ExceptionFuncs
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, EmailStr


class LoginBody(BaseModel):
    email: EmailStr  # NoSQLインジェクション対策: 厳密なメールアドレス検証
    password: str


class Response(MultiPartModel):
    accesstoken: str
    refreshtoken: str


router = APIRouter()

ENDPOINT = Endpoints.Auth.login
TAGS = [Tags.auth]
RESPONSES = BasicResponses.set_success_model(Response)


@router.post(
    ENDPOINT,
    tags=TAGS,
    responses=RESPONSES,
)
async def endpoint(
    body: LoginBody,
    db: AsyncIOMotorDatabase = Depends(DbFuncs.get_database),
):
    # ユーザーを取得（パスワード検証は後で行う）
    user = await db[COLLLECTION.REGISTRANT].find_one(
        {
            "$and": [
                {REGISTRANT.EMAIL: body.email},
                {REGISTRANT.IS_AUTHENTICATED: True},
                {REGISTRANT.DELETE_DATE: None},
            ]
        }
    )

    if not user:
        ExceptionFuncs.raise_unauthorized(ERROR_MESSAGE.CERTIFICATION_FAILED)

    # bcryptでパスワードを検証
    if not AuthFuncs.verify_password(body.password, user[REGISTRANT.PASSWORD]):
        ExceptionFuncs.raise_unauthorized(ERROR_MESSAGE.CERTIFICATION_FAILED)

    access_token = AuthFuncs.get_access_token(user[REGISTRANT.USER_ID])
    refresh_token = AuthFuncs.get_refresh_token(user[REGISTRANT.USER_ID])

    return Response(accesstoken=access_token, refreshtoken=refresh_token)
