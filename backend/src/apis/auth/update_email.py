
from constants import BasicResponses, Endpoints, Tags
from constants.other import (COLLLECTION, EMAIL_MESSAGE, ERROR_MESSAGE,
                             REGISTRANT, SUCCESS_MESSAGE)
from fastapi import APIRouter, Depends, Request
from fastapi.security import HTTPBearer
from fastapi_jwt_auth import AuthJWT
from funcs import AuthFuncs, DbFuncs, ExceptionFuncs, UtilFuncs, send_mail
from funcs.util_funcs import UtilFuncs
from pydantic import BaseModel


class RequestModel(BaseModel):
    email: str


class Response(BaseModel):
    message: str


router = APIRouter()

ENDPOINT = Endpoints.Auth.update_email
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

    email = request_model.email
    # emailのフォーマット確認
    res = AuthFuncs.is_email_format(email)
    if not res:
        ExceptionFuncs.raise_bad_request(ERROR_MESSAGE.INVALID_MAIL_FORMAT)

    # emailが既に登録されているか確認
    is_email_exists = await AuthFuncs.email_exists(collection, request_model.email, True)

    if is_email_exists:
        ExceptionFuncs.raise_conflict(ERROR_MESSAGE.DUPLICATED)

    user = await collection.find_one({REGISTRANT.USER_ID: token_info.user_id})
    onePassword = AuthFuncs.random_name(6)
    result = await collection.update_one(
        {"$and": [
            {REGISTRANT.USER_ID: token_info.user_id},
            {REGISTRANT.DELETE_DATE: None}
        ]},
        {"$set": {
            REGISTRANT.EMAIL_UPDATE: email,
            REGISTRANT.ONETIME_PASSWORD: onePassword,
            REGISTRANT.NUMBER_GENRATION: AuthFuncs.get_next_number_genration(user[REGISTRANT.NUMBER_GENRATION]),
            REGISTRANT.UPDATE_DATE: UtilFuncs.get_now_isodatetime()
        }},
    )

    if result.matched_count == 0:
        ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    # 有効期限を設定。
    send_mail.send_mail_aws(EMAIL_MESSAGE.AWS_EMAIL_SUBJECT,
                            email,
                            EMAIL_MESSAGE.AWS_EMAIL_BODY.format(onePassword=onePassword)
                            )
    return Response(message=SUCCESS_MESSAGE.UPDATE)
