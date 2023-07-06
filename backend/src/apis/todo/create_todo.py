from typing import List, Optional, Union

from constants import BasicResponses, Endpoints, Tags
from constants.models import TodoRequestModel
from constants.other import COLLLECTION, ERROR_MESSAGE, SUCCESS_MESSAGE, TODO
from fastapi import APIRouter, Depends, File, Form, Header, Request
from funcs import AuthFuncs, DbFuncs, ExceptionFuncs
from funcs.todo_funcs import TodoFuncs
from funcs.util_funcs import UtilFuncs
from pydantic import BaseModel


class Response(BaseModel):
    message: str


router = APIRouter()

ENDPOINT = Endpoints.Todo.create_todo
TAGS = [Tags.todo]
RESPONSES = BasicResponses.set_success_model(Response)


@router.post(ENDPOINT, tags=TAGS, responses=RESPONSES)
async def endpoint(
    request: Request,
    attachments: Union[List[bytes], None] = File(default=None),
    request_model: TodoRequestModel = Form(...),
    db=Depends(DbFuncs.get_database)
):
    # DBのコレクションを定義
    collection = db[COLLLECTION.TODO]
    token_info: AuthFuncs.TokenPayload = request.state.token_info
    TodoFuncs.check_tododata(attachments, request_model)
    todo_id = UtilFuncs.get_uniqueid()
    attachments_up, attachments_hash = TodoFuncs.get_attachments(attachments,
                                                                 token_info.user_id,
                                                                 todo_id)

    date_start = UtilFuncs.get_date_isoformat(request_model.date_start)
    date_end = UtilFuncs.get_date_isoformat(request_model.date_end)

    # TODO TODOクラスからの値取得がtitle以降できない(Noneになる)
    result = await collection.insert_one(
            {
                TODO.USER_ID: token_info.user_id,
                TODO.TODO_ID: todo_id,
                TODO.TITLE: request_model.title,
                TODO.DESCRIPTION: request_model.description,
                TODO.ATTACHMENTS: attachments_up,
                TODO.ATTACHMENTS_HASH: attachments_hash,
                TODO.DATE_START: date_start,
                TODO.DATE_END: date_end,
                TODO.TAGS: request_model.tags,
                TODO.CURRENT_STATE: request_model.current_state.value,
                TODO.COLOR: request_model.color,
                TODO.DELETE_DATE: None,
                TODO.CREATE_DATE: UtilFuncs.get_now_isodatetime()
            }
        )

    if not result.acknowledged:
        ExceptionFuncs.raise_internal_server_error(ERROR_MESSAGE.CREATE_FAILED)

    return Response(message=SUCCESS_MESSAGE.CREATE)
