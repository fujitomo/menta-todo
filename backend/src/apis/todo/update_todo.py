from typing import List, Optional, Union

from constants import BasicResponses, Endpoints, Tags
from constants.models import TodoUpdateRequestModel
from constants.other import (COLLLECTION, ERROR_MESSAGE, SUCCESS_MESSAGE, TODO,
                             TODO_STATE)
from fastapi import APIRouter, Depends, File, Header, Request, UploadFile
from funcs import AuthFuncs, DbFuncs, ExceptionFuncs
from funcs.todo_funcs import TodoFuncs
from funcs.util_funcs import UtilFuncs
from pydantic import BaseModel


class Response(BaseModel):
    message: str


router = APIRouter()

ENDPOINT = Endpoints.Todo.update_todo
TAGS = [Tags.todo]
RESPONSES = BasicResponses.set_success_model(Response)


@router.post(ENDPOINT, tags=TAGS, responses=RESPONSES)
async def endpoint(
    request: Request,
    request_model: TodoUpdateRequestModel,
    attachments: Union[List[UploadFile], None] = File(default=None),
    db=Depends(DbFuncs.get_database)
):
    # DBのコレクションを定義
    collection = db[COLLLECTION.TODO]
    token_info: AuthFuncs.TokenPayload = request.state.token_info
    TodoFuncs.check_tododata(attachments, request_model)

    old_data = await collection.find_one(
                     {"$and": [{TODO.TODO_ID: request_model.todo_id},
                               {TODO.DELETE_DATE: {"$eq": None}}]},
                     {TODO.ATTACHMENTS: 1,
                      TODO.ATTACHMENTS_HASH: 1,
                      TODO.CURRENT_STATE: 1}
    )

    if not old_data:
        ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    attachments_up, new_attachments_hash = TodoFuncs.get_attachments(
        attachments,
        token_info.user_id,
        request_model.todo_id,
        old_data[TODO.ATTACHMENTS],
        old_data[TODO.ATTACHMENTS_HASH]
    )

    date_start = UtilFuncs.get_date_isoformat(request_model.date_start)
    date_end = UtilFuncs.get_date_isoformat(request_model.date_end)

    completed_date = None
    if (request_model.current_state == TODO_STATE.FOLDER_COMPLETED_ATTACHMENT and
            old_data[TODO.CURRENT_STATE] != TODO_STATE.FOLDER_COMPLETED_ATTACHMENT):
        completed_date = UtilFuncs.get_now_isodate()

    result = await collection.update_one(
            {"$and": [{TODO.USER_ID: token_info.user_id},
                      {TODO.TODO_ID: request_model.todo_id},
                      {TODO.DELETE_DATE: None}]},
            {"$set": {
                TODO.TITLE: request_model.title,
                TODO.DESCRIPTION: request_model.description,
                TODO.ATTACHMENTS: attachments_up,
                TODO.ATTACHMENTS_HASH: new_attachments_hash,
                TODO.DATE_START: date_start,
                TODO.DATE_END: date_end,
                TODO.TAGS: request_model.tags,
                TODO.CURRENT_STATE: request_model.current_state.value,
                TODO.COLOR: request_model.color,
                TODO.COMPLETED_DATE: completed_date,
                TODO.UPDATE_DATE: UtilFuncs.get_now_isodatetime()
            }})

    if not result:
        ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    return Response(message=(SUCCESS_MESSAGE.UPDATE))
