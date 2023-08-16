
from constants import BasicResponses, Endpoints, Tags
from constants.other import (COLLLECTION, ERROR_MESSAGE, REGISTRANT,
                             SUCCESS_MESSAGE)
from fastapi import APIRouter, Depends, Request
from fastapi.security import HTTPBearer
from fastapi_jwt_auth import AuthJWT
from funcs import AuthFuncs, DbFuncs, ExceptionFuncs, UtilFuncs
from pydantic import BaseModel


class RequestModel(BaseModel):
    onetime_password: str


class Response(BaseModel):
    message: str


router = APIRouter()

ENDPOINT = Endpoints.Auth.update_email_authentication
TAGS = [Tags.auth]
RESPONSES = BasicResponses.set_success_model(Response)

bearer_scheme = HTTPBearer()

@router.post(
    ENDPOINT,
    tags=TAGS,
    responses=RESPONSES,
    dependencies=[Depends(bearer_scheme)]
)
# Authorizeはswagger用
async def endpoint(
    request: Request,
    request_model: RequestModel,
    db=Depends(DbFuncs.get_database),
    Authorize: AuthJWT = Depends()
):
    # DBのコレクションを定義
    collection = db[COLLLECTION.REGISTRANT]
    token_info: AuthFuncs.TokenPayload = request.state.token_info


    user = await collection.find_one(
            {REGISTRANT.USER_ID: token_info.user_id}
    )

    if not user:
        ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    # メソッド内に検証回数チェック処理があるため、ここで実行
    number_verification = AuthFuncs.get_next_number_verification(
        user[REGISTRANT.NUMBER_VERIFICATION])

    result = await collection.update_one(
        {"$and": [
            {REGISTRANT.USER_ID: token_info.user_id},
            {REGISTRANT.DELETE_DATE: None}
        ]},
        {"$set": {
            REGISTRANT.NUMBER_VERIFICATION: number_verification,
            REGISTRANT.UPDATE_DATE: UtilFuncs.get_now_isodatetime()
        }},
    )

    if result.matched_count == 0:
        ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    if user[REGISTRANT.ONETIME_PASSWORD] != request_model.onetime_password:
        ExceptionFuncs.raise_unauthorized(ERROR_MESSAGE.TOKEN_PASSWORD)

    result = await collection.update_one(
        {"$and": [
            {REGISTRANT.USER_ID: token_info.user_id},
            {REGISTRANT.DELETE_DATE: None}
        ]},
        {"$set": {
            REGISTRANT.EMAIL: user[REGISTRANT.EMAIL_UPDATE],
            REGISTRANT.ONETIME_PASSWORD: "none",
            REGISTRANT.NUMBER_VERIFICATION: REGISTRANT.INIT_NUMBER_VERIFICATION,
            REGISTRANT.UPDATE_DATE: UtilFuncs.get_now_isodatetime()
        }},
    )

    if result.matched_count == 0:
        ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    return Response(message=SUCCESS_MESSAGE.UPDATE)
