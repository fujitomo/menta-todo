import datetime

from constants import BasicResponses, Endpoints, Tags
from constants.other import (COLLLECTION, EMAIL_MESSAGE, ERROR_MESSAGE,
                             REGISTRANT)
from fastapi import APIRouter, Depends
from funcs import AuthFuncs, DbFuncs, ExceptionFuncs, send_mail
from funcs.auth_funcs import TokenPayload, TokenType
from funcs.util_funcs import UtilFuncs
from pydantic import BaseModel


class Request(BaseModel):
    email: str
    password: str


class Response(BaseModel):
    accesstoken: str


router = APIRouter()

ENDPOINT = Endpoints.Auth.create_account
TAGS = [Tags.auth]
RESPONSES = BasicResponses.set_success_model(Response)


@router.post(
    ENDPOINT,
    tags=TAGS,
    responses=RESPONSES
)
async def endpoint(request: Request,
                   db=Depends(DbFuncs.get_database)):
    # DBのコレクションを定義
    collection = db[COLLLECTION.REGISTRANT]

    # DBへの無駄なアクセスを防ぐため、パスワードを先にチェック
    password = request.password
    is_password_format = AuthFuncs.is_password_format(password)
    if not is_password_format:
        ExceptionFuncs.raise_bad_request(ERROR_MESSAGE.PASSWORD_LIMIT)

    email = request.email
    # emailのフォーマット確認
    is_email_format = AuthFuncs.is_email_format(email)
    if not is_email_format:
        ExceptionFuncs.raise_bad_request(ERROR_MESSAGE.INVALID_MAIL_FORMAT)

    # emailが既に登録されているか確認
    is_email_exists = await AuthFuncs.email_exists(collection, email, True)
    if is_email_exists:
        ExceptionFuncs.raise_conflict(ERROR_MESSAGE.DUPLICATED)

    # メールアドレスが登録されているか確認
    is_email_exists = await AuthFuncs.email_exists(collection, email, False)
    onePassword = AuthFuncs.random_name(6)
    # パスワードをハッシュ化
    hash_password = AuthFuncs.create_hash(password)
    if is_email_exists:
        user_id = is_email_exists[REGISTRANT.USER_ID]
        number_genration = AuthFuncs.get_next_number_genration(is_email_exists[REGISTRANT.NUMBER_GENRATION])
        result = await collection.update_one(
            {"$and": [
                         {REGISTRANT.EMAIL: email},
                         {REGISTRANT.DELETE_DATE: None}]},
            {"$set": {
                REGISTRANT.PASSWORD: hash_password,
                REGISTRANT.ONETIME_PASSWORD: onePassword,
                REGISTRANT.NUMBER_GENRATION: number_genration,
                REGISTRANT.NUMBER_VERIFICATION: REGISTRANT.INIT_NUMBER_VERIFICATION,
                REGISTRANT.UPDATE_DATE: UtilFuncs.get_now_isodatetime()
            }},
        )

        if result.matched_count == 0:
            ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    else:
        user_id = UtilFuncs.get_uniqueid()
        result = await collection.insert_one({
                REGISTRANT.USER_ID: user_id,
                REGISTRANT.EMAIL: email,
                REGISTRANT.PASSWORD: hash_password,
                REGISTRANT.ONETIME_PASSWORD: onePassword,
                REGISTRANT.NUMBER_GENRATION: AuthFuncs.get_new_number(),
                REGISTRANT.NUMBER_VERIFICATION: REGISTRANT.INIT_NUMBER_VERIFICATION,
                REGISTRANT.IS_AUTHENTICATED: False,
                REGISTRANT.DELETE_DATE: None,
                REGISTRANT.CREATE_DATE: UtilFuncs.get_now_isodatetime()
        })

        if not result.acknowledged:
            ExceptionFuncs.raise_internal_server_error(ERROR_MESSAGE.CREATE_FAILED)

    # 有効期限を設定。
    expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=+10)
    send_mail.send_mail_aws(EMAIL_MESSAGE.AWS_EMAIL_SUBJECT,
                            email,
                            EMAIL_MESSAGE.AWS_EMAIL_BODY.format(onePassword=onePassword)
                            )

    token = AuthFuncs.create_token(
        payload=TokenPayload(user_id=user_id,
                             type=TokenType.TMP.value,
                             exp=int(expires.timestamp())))
    return Response(accesstoken=token)























