from constants import BasicResponses, Endpoints, Tags
from constants.models import MultiPartModel
from constants.other import COLLLECTION, ERROR_MESSAGE, REGISTRANT
from fastapi import APIRouter, Depends
from funcs import AuthFuncs, DbFuncs, ExceptionFuncs
from pydantic import BaseModel


class Request(BaseModel):
    email: str
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
    request: Request,
    db=Depends(DbFuncs.get_database)
):
    password = request.password
    # パスワードをハッシュ化
    hash_password = AuthFuncs.create_hash(password)

    user = await db[COLLLECTION.REGISTRANT].find_one(
        {"$and": [{REGISTRANT.EMAIL: request.email},
                  {REGISTRANT.PASSWORD: hash_password},
                  {REGISTRANT.IS_AUTHENTICATED: True},
                  {REGISTRANT.DELETE_DATE: None}]})

    if not user:
        ExceptionFuncs.raise_unauthorized(ERROR_MESSAGE.CERTIFICATION_FAILED)

    access_token = AuthFuncs.get_access_token(user[REGISTRANT.USER_ID])
    refresh_token = AuthFuncs.get_refresh_token(user[REGISTRANT.USER_ID])
    
    print('refreshtoken:{refresh_token}')

    return Response(accesstoken=access_token,refreshtoken=refresh_token)
