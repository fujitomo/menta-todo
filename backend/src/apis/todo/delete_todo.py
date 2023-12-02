
from constants import BasicResponses, Endpoints, Tags
from constants.other import COLLLECTION, ERROR_MESSAGE, SUCCESS_MESSAGE, TODO
from fastapi import APIRouter, Depends, Request
from fastapi.security import HTTPBearer
from fastapi_jwt_auth import AuthJWT
from funcs import AuthFuncs, DbFuncs, ExceptionFuncs, UtilFuncs
from funcs.todo_funcs import TodoFuncs
from pydantic import BaseModel
from fastapi import Query

class RequestModel(BaseModel):
    todo_id: str


class Response(BaseModel):
    message: str


router = APIRouter()

ENDPOINT = Endpoints.Todo.delete_todo
TAGS = [Tags.todo]
RESPONSES = BasicResponses.set_success_model(Response)

bearer_scheme = HTTPBearer()

@router.delete(ENDPOINT,
               tags=TAGS,
               responses=RESPONSES,
               dependencies=[Depends(bearer_scheme)])
# Authorizeはswagger用
async def endpoint(
    request: Request,
    todo_id: str = Query(...),  # DELETEメソッドはリクエストボディを受け取ろうとするとミドルウェア処理で403エラーになるため、クエリパラメータで受け取る
    db=Depends(DbFuncs.get_database),
    Authorize: AuthJWT = Depends()
):
    print("test")
    # DBのコレクションを定義
    collection = db[COLLLECTION.TODO]
    token_info: AuthFuncs.TokenPayload = request.state.token_info

    count = await collection.count_documents(
                     {"$and": [
                         {TODO.USER_ID: token_info.user_id},
                         {TODO.TODO_ID: todo_id},
                         {TODO.DELETE_DATE: None}]}
    )

    if count == 0:
        ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    result = await collection.update_one(
            {"$and": [{TODO.TODO_ID: todo_id},
                      {TODO.DELETE_DATE: {"$eq": None}}]},
            {"$set": {
                TODO.DELETE_DATE: UtilFuncs.get_now_isodatetime()
            }})

    if result.matched_count == 0:
        ExceptionFuncs.raise_not_found(ERROR_MESSAGE.NOT_FOUND)

    # 添付ファイル削除
    is_delete = TodoFuncs.delete_attachments(token_info.user_id,
                                             todo_id)

    if not is_delete:
        ExceptionFuncs.raise_internal_server_error(ERROR_MESSAGE.DELETE_FAILED)

    return Response(message=SUCCESS_MESSAGE.DELETE)
