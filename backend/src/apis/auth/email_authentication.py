from typing import Optional

from constants import BasicResponses, Endpoints, Tags
from constants.other import COLLLECTION, ERROR_MESSAGE, REGISTRANT
from fastapi import APIRouter, Depends, Header, Request
from funcs import AuthFuncs, DbFuncs, ExceptionFuncs, UtilFuncs
from pydantic import BaseModel


class RequestModel(BaseModel):
    onetimepassword: str


class Response(BaseModel):
    access_token: str
    refresh_token: str


router = APIRouter()

ENDPOINT = Endpoints.Auth.email_authentication
TAGS = [Tags.auth]
RESPONSES = BasicResponses.set_success_model(Response)


@router.post(
    ENDPOINT,
    tags=TAGS,
    responses=RESPONSES
)
async def endpoint(
    request: RequestModel,
    db=Depends(DbFuncs.get_database)
):
    # DBのコレクションを定義
    collection = db[COLLLECTION.REGISTRANT]
    token_info: AuthFuncs.TokenPayload = request.state.token_info

    user = await collection.find_one(
            {REGISTRANT.USER_ID: token_info.user_id}
    )

    if user[REGISTRANT.IS_AUTHENTICATED]:
        ExceptionFuncs.raise_conflict(ERROR_MESSAGE.DUPLICATED)

    # メソッド内に検証回数チェック処理があるため、ここで実行
    number_verification = AuthFuncs.get_next_number_verification(
        user[REGISTRANT.NUMBER_VERIFICATION])

    result = await collection.update_one(
        {"$and": [
            {REGISTRANT.USER_ID: token_info.user_id},
            {REGISTRANT.DELETE_DATE: None}]},
        {"$set": {
            REGISTRANT.NUMBER_VERIFICATION: number_verification,
            REGISTRANT.UPDATE_DATE: UtilFuncs.get_now_isodatetime()
        }},
    )

    if result.matched_count == 0:
        ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    # print(user[REGISTRANT.ONETIME_PASSWORD])
    # print(request_model.onetime_password)
    # if user[REGISTRANT.ONETIME_PASSWORD] != request_model.onetime_password:
    #     ExceptionFuncs.raise_unauthorized(ERROR_MESSAGE.TOKEN_PASSWORD)

    result = await collection.update_one(
        {"$and": [
            {REGISTRANT.USER_ID: token_info.user_id},
            {REGISTRANT.DELETE_DATE: None}]},
        {"$set": {
            REGISTRANT.IS_AUTHENTICATED: True,
            REGISTRANT.ONETIME_PASSWORD: "none",
            REGISTRANT.NUMBER_VERIFICATION: REGISTRANT.INIT_NUMBER_VERIFICATION,
            REGISTRANT.UPDATE_DATE: UtilFuncs.get_now_isodatetime()
        }},
    )

    if result.matched_count == 0:
        ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    access_token = AuthFuncs.get_access_token(token_info.user_id)
    refresh_token = AuthFuncs.get_refresh_token(token_info.user_id)

    return Response(access_token=access_token, refresh_token=refresh_token)
