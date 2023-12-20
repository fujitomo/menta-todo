
from funcs.util_funcs import UtilFuncs
from funcs.todo_funcs import TodoFuncs
from constants import BasicResponses, Endpoints, Tags
from constants.models import TodoResponsModel
from constants.other import COLLLECTION, ERROR_MESSAGE, TODO
from fastapi import APIRouter, Depends, Request
from fastapi.security import HTTPBearer
from fastapi_jwt_auth import AuthJWT
from funcs import AuthFuncs, DbFuncs, ExceptionFuncs
from pydantic import BaseModel


class RequestModel(BaseModel):
    todo_id: str


router = APIRouter()

ENDPOINT = Endpoints.Todo.get_todo
TAGS = [Tags.todo]
RESPONSES = BasicResponses.set_success_model(TodoResponsModel)

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
    collection = db[COLLLECTION.TODO]
    token_info: AuthFuncs.TokenPayload = request.state.token_info

    todo_data = await collection.find_one(
                     {"$and": [{TODO.USER_ID: token_info.user_id},
                               {TODO.TODO_ID: request_model.todo_id},
                               {TODO.DELETE_DATE: {"$eq": None}}]},
                     {TODO.ATTACHMENTS_HASH: 0,
                      "_id": 0}
    )

    processed_attachments = []
    attachments = todo_data[TODO.ATTACHMENTS]
    if attachments:
        for attachment in attachments:
            if attachment:
                processed_attachments.append(UtilFuncs.create_signed_url(attachment))
            else:
                processed_attachments.append("")


        todo_data[TODO.ATTACHMENTS] = processed_attachments

    if not todo_data:
        ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    return TodoResponsModel(**todo_data)
