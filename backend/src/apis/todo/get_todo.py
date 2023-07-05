from typing import Optional

from constants import BasicResponses, Endpoints, Tags
from constants.models import TodoResponsModel
from constants.other import COLLLECTION, ERROR_MESSAGE, TODO
from fastapi import APIRouter, Depends, Header, Request
from funcs import AuthFuncs, DbFuncs, ExceptionFuncs
from pydantic import BaseModel


class RequestModel(BaseModel):
    todo_id: str


router = APIRouter()

ENDPOINT = Endpoints.Todo.get_todo
TAGS = [Tags.todo]
RESPONSES = BasicResponses.set_success_model(TodoResponsModel)


@router.post(
    ENDPOINT,
    tags=TAGS,
    responses=RESPONSES
)
async def endpoint(
    request: Request,
    request_model: RequestModel,
    db=Depends(DbFuncs.get_database)
):
    # DBのコレクションを定義
    collection = db[COLLLECTION.TODO]
    token_info: AuthFuncs.TokenPayload = request.state.token_info

    todo_data = await collection.find_one(
                     {"$and": [{TODO.USER_ID: token_info.user_id},
                               {TODO.TODO_ID: request_model.todo_id},
                               {TODO.DELETE_DATE: {"$eq": None}}]},
                     {TODO.ATTACHMENTS_HASH: 0,
                      "_id": 0}
    )

    if not todo_data:
        ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    print(todo_data)
    return TodoResponsModel(**todo_data)
