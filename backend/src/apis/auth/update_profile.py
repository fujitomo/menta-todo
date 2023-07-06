from datetime import date
from typing import Optional, Union

from constants import BasicResponses, Endpoints, Tags
from constants.models import MultiPartModel
from constants.other import (COLLLECTION, ERROR_MESSAGE, REGISTRANT, SETTINGS,
                             SUCCESS_MESSAGE)
from fastapi import APIRouter, Depends, File, Form, Header, Request, UploadFile
from funcs import AuthFuncs, DbFuncs, ExceptionFuncs
from funcs.upload_file import FileManager
from funcs.util_funcs import UtilFuncs
from pydantic import BaseModel


class RequestModel(MultiPartModel):
    username: Union[str, None] = None
    birthday: Union[date, None] = None
    avatar_name: Union[str, None] = None


class Response(BaseModel):
    message: str


router = APIRouter()

ENDPOINT = Endpoints.Auth.update_profile
TAGS = [Tags.auth]
RESPONSES = BasicResponses.set_success_model(Response)


@router.post(
    ENDPOINT,
    tags=TAGS,
    responses=RESPONSES
)
async def endpoint(
    request: Request,
    request_model: RequestModel = Form(...),
    file: Union[UploadFile, None] = File(default=None),
    db=Depends(DbFuncs.get_database)
):
    # DBのコレクションを定義
    collection = db[COLLLECTION.REGISTRANT]
    token_info: AuthFuncs.TokenPayload = request.state.token_info
    result = await collection.update_one(
        {"$and": [{REGISTRANT.USER_ID: token_info.user_id},
                  {REGISTRANT.BIRTHDAY: {"$exists": True}}]},
        {"$set": {
            REGISTRANT.USER_NAME: request_model.username,
            REGISTRANT.BIRTHDAY:  UtilFuncs.get_date_isoformat(request_model.birthday),
            REGISTRANT.AVATAR_NAME:  request_model.avatar_name,
            REGISTRANT.UPDATE_DATE: UtilFuncs.get_now_isodatetime()
        }},
    )

    if result.matched_count == 0:
        ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    if file:
        file_byte = await file.read()
        hs = FileManager.hash_binary_to_md5(file_byte)
        db_hs = await AuthFuncs.get_avatar_photo_hash(collection, token_info.user_id)

        if not db_hs:
            ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

        if hs != db_hs:
            file_manager = FileManager()
            avatar_image = file_manager.upload(
                file_byte,
                f'{token_info.user_id}/{SETTINGS.FOLDER_AVATAR_PHOTO}'
            )
            result = await collection.update_one(
                {"$and": [
                    {REGISTRANT.USER_ID: token_info.user_id},
                    {REGISTRANT.BIRTHDAY: {"$exists": True}},
                    {REGISTRANT.DELETE_DATE: None}]},
                {"$set": {
                    REGISTRANT.AVATAR_PHOTO: avatar_image,
                    REGISTRANT.AVATAR_PHOTO_HASH: hs,
                    REGISTRANT.UPDATE_DATE: UtilFuncs.get_now_isodatetime()
                }},
            )

            if not result.modified_count:
                ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    return Response(message=SUCCESS_MESSAGE.UPDATE)
