
from constants import BasicResponses, Endpoints, Tags
from constants.other import (COLLLECTION, ERROR_MESSAGE, REGISTRANT,
                             SUCCESS_MESSAGE)
from fastapi import APIRouter, Depends, Request
from fastapi.security import HTTPBearer
from fastapi_jwt_auth import AuthJWT
from funcs import AuthFuncs, DbFuncs, ExceptionFuncs, UtilFuncs
from funcs.util_funcs import UtilFuncs
from pydantic import BaseModel


class RequestModel(BaseModel):
    new_password: str
    old_password: str


class Response(BaseModel):
    message: str


router = APIRouter()

ENDPOINT = Endpoints.Auth.update_password
TAGS = [Tags.auth]
RESPONSES = BasicResponses.set_success_model(Response)

bearer_scheme = HTTPBearer()

@router.post(
    ENDPOINT,
    tags=TAGS,
    responses=RESPONSES,
    dependencies=[Depends(bearer_scheme)]
)
async def endpoint(
    request: Request,
    request_model: RequestModel,
    db=Depends(DbFuncs.get_database),
    Authorize: AuthJWT = Depends()
):
    # DBのコレクションを定義
    collection = db[COLLLECTION.REGISTRANT]
    token_info: AuthFuncs.TokenPayload = request.state.token_info

    new_password = request_model.new_password
    # DBへの無駄なアクセスを防ぐため、先にチェック
    is_password_format = AuthFuncs.is_password_format(new_password)
    if not is_password_format:
        ExceptionFuncs.raise_bad_request(ERROR_MESSAGE.INVAID_PASSWORD_FORMAT)

    old_password = await collection.find_one(
        {"$and": [
            {REGISTRANT.USER_ID: token_info.user_id},
            {REGISTRANT.DELETE_DATE: None}
        ]},
        {REGISTRANT.PASSWORD: 1}
    )

    if not old_password:
        ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    hash_old_password = AuthFuncs.create_hash(request_model.old_password)
    if old_password[REGISTRANT.PASSWORD] != hash_old_password:
        ExceptionFuncs.raise_bad_request(ERROR_MESSAGE.PASSWORD_BEFORE)

    hash_new_password = AuthFuncs.create_hash(request_model.new_password)
    update_password = await collection.update_one(
        {"$and": [
            {REGISTRANT.USER_ID: token_info.user_id},
            {REGISTRANT.DELETE_DATE: None}
        ]},
        {"$set": {
            REGISTRANT.PASSWORD: hash_new_password,
            REGISTRANT.UPDATE_DATE: UtilFuncs.get_now_isodatetime()
        }},
    )

    if not update_password:
        ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    return Response(message=SUCCESS_MESSAGE.UPDATE)
