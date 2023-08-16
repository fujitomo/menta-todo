from typing import Union

from constants import BasicResponses, Endpoints, Tags
from constants.other import COLLLECTION, ERROR_MESSAGE, REGISTRANT
from fastapi import APIRouter, Depends, Request
from fastapi.security import HTTPBearer
from fastapi_jwt_auth import AuthJWT
from funcs import AuthFuncs, DbFuncs, ExceptionFuncs
from pydantic import BaseModel


class Response(BaseModel):
    user_name: Union[str, None] = None
    birthday: Union[str, None] = None
    avatar_photo: Union[str, None] = None
    avatar_name: Union[str, None] = None


router = APIRouter()

ENDPOINT = Endpoints.Auth.get_profile
TAGS = [Tags.auth]
RESPONSES = BasicResponses.set_success_model(Response)

bearer_scheme = HTTPBearer()

@router.get(
    ENDPOINT,
    tags=TAGS,
    responses=RESPONSES,
    dependencies=[Depends(bearer_scheme)]
)
# Authorizeはswagger用
async def endpoint(
    request: Request,
    db=Depends(DbFuncs.get_database),
    Authorize: AuthJWT = Depends()
):
    # DBのコレクションを定義
    collection = db[COLLLECTION.REGISTRANT]
    token_info: AuthFuncs.TokenPayload = request.state.token_info

    profile = await collection.find_one(
        {"$and": [
            {REGISTRANT.USER_ID: token_info.user_id},
            {REGISTRANT.BIRTHDAY: {"$exists": True}},
            {REGISTRANT.DELETE_DATE: None}]},
        {REGISTRANT.USER_NAME: 1,
         REGISTRANT.BIRTHDAY: 1,
         REGISTRANT.AVATAR_PHOTO: 1,
         REGISTRANT.AVATAR_NAME: 1}
    )

    if not profile:
        ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    return Response(**profile)
