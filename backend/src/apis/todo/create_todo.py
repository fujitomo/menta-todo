from typing import List, Optional

from constants import BasicResponses, Endpoints, Tags
from constants.models import TodoRequestModel
from constants.other import COLLLECTION, ERROR_MESSAGE, SUCCESS_MESSAGE, TODO
from fastapi import APIRouter, Depends, File, Form, Request
from fastapi.security import HTTPBearer
from fastapi_jwt_auth import AuthJWT
from funcs import AuthFuncs, DbFuncs, ExceptionFuncs, UtilFuncs
from funcs.todo_funcs import TodoFuncs
from funcs.util_funcs import UtilFuncs
from pydantic import BaseModel
from fastapi import UploadFile

class Response(BaseModel):
    message: str


router = APIRouter()

ENDPOINT = Endpoints.Todo.create_todo
TAGS = [Tags.todo]
RESPONSES = BasicResponses.set_success_model(Response)

bearer_scheme = HTTPBearer()

@router.post(ENDPOINT,
             tags=TAGS,
             responses=RESPONSES,
             dependencies=[Depends(bearer_scheme)])
# Authorizeはswagger用
async def endpoint(
    request: Request,
    attachments: Optional[List[UploadFile]] = File(default=None),
    request_model: TodoRequestModel = Form(...),
    db=Depends(DbFuncs.get_database),
    Authorize: AuthJWT = Depends()
):
    # DBのコレクションを定義
    collection = db[COLLLECTION.TODO]
    token_info: AuthFuncs.TokenPayload = request.state.token_info
    await TodoFuncs.check_tododata(attachments, request_model)
    todo_id = UtilFuncs.get_uniqueid()
    attachments_up, attachments_hash = TodoFuncs.get_attachments(attachments,
                                                                 token_info.user_id,
                                                                 todo_id)

    date_start = UtilFuncs.get_date_isoformat(request_model.date_start)
    date_end = UtilFuncs.get_date_isoformat(request_model.date_end)

    state = request_model.current_state.value if request_model.current_state is not None else None
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
                TODO.CURRENT_STATE: state,
                TODO.COLOR: request_model.color,
                TODO.DELETE_DATE: None,
                TODO.CREATE_DATE: UtilFuncs.get_now_isodatetime()
            }
        )

    if not result.acknowledged:
        ExceptionFuncs.raise_internal_server_error(ERROR_MESSAGE.CREATE_FAILED)

    return Response(message=SUCCESS_MESSAGE.CREATE)
