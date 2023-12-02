
from typing import List, Optional

from constants import BasicResponses, Endpoints, Tags
from constants.models import TodoListRequestModel, TodoResponsModel
from constants.other import COLLLECTION, ERROR_MESSAGE, REGISTRANT, TODO
from fastapi import (APIRouter, Depends, FastAPI, Header, HTTPException,
                     Request, status)
from fastapi.security import HTTPBearer
from fastapi_jwt_auth import AuthJWT
from funcs import AuthFuncs, DbFuncs, ExceptionFuncs, UtilFuncs
from funcs.util_funcs import UtilFuncs
from pydantic import BaseModel
from funcs.todo_funcs import TodoFuncs
from constants import env

router = APIRouter()

ENDPOINT = Endpoints.Todo.get_todolist
TAGS = [Tags.todo]
RESPONSES = BasicResponses.set_success_model(List[TodoResponsModel])

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
    request_model: TodoListRequestModel,
    db=Depends(DbFuncs.get_database),
    Authorize: AuthJWT = Depends()
):
    # DBのコレクションを定義
    collection = db[COLLLECTION.TODO]
    token_info: AuthFuncs.TokenPayload = request.state.token_info

    search = {}

    search[TODO.USER_ID] = token_info.user_id

    if request_model.title:
        regex_pattern = f".*{request_model.title}.*"
        search[TODO.TITLE] = {"$regex": regex_pattern, "$options": "i"}

    if request_model.description:
        regex_pattern = f".*{request_model.description}.*"
        search[TODO.DESCRIPTION] = {"$regex": regex_pattern, "$options": "i"}

    if request_model.attachments_existence:
        if request_model.attachments_existence:
            search["attachments.0"] = {"$exists": True}
        else:
            search["attachments.0"] = {"$exists": False}

    if request_model.work_date:
        work_date = UtilFuncs.get_date_isoformat(request_model.work_date)
        search[TODO.DATE_START] = {"$gte": work_date}
        search[TODO.DATE_END] = {"$lte": work_date}


    if request_model.tags_existence is not None:
        if request_model.tags_existence:
            print(request_model.tag)
            if request_model.tag:
                search[TODO.TAGS] = {"$all": request_model.tag }
            else:
                search["tags.0"] = {"$exists": True}
        else:
            search["tags.0"] = {"$exists": False}

    if request_model.current_state:
        search[TODO.CURRENT_STATE] = request_model.current_state.value

    if request_model.color:
        search[TODO.COLOR] = request_model.color

    if request_model.create_date_start:
        create_date_start = UtilFuncs.get_date_isoformat(request_model.create_date_start)
        search[TODO.DATE_START] = {"$gte": create_date_start}

    if request_model.create_date_end:
        create_date_end = UtilFuncs.get_date_isoformat(request_model.create_date_end)
        search[TODO.DATE_END] = {"$lte": create_date_end}

    if request_model.completed_date_start:
        completed_date_start = UtilFuncs.get_date_isoformat(request_model.completed_date_start)
        search[TODO.COMPLETED_DATE] = {"$gte": completed_date_start}

    if request_model.completed_date_end:
        completed_date_end = UtilFuncs.get_date_isoformat(request_model.completed_date_end)
        search[TODO.COMPLETED_DATE] = {"$lte": completed_date_end}

    search[TODO.DELETE_DATE] = {"$eq": None}

    todolist_data = await collection.find(
                     search,
                     {TODO.ATTACHMENTS_HASH: 0,
                      "_id": 0}).to_list(length=None)

    processed_attachments = []
    for item in todolist_data:
        attachments = item[TODO.ATTACHMENTS]

        print("attachments", attachments)
        if attachments:
            for attachment in attachments:
                if attachment:
                    print("attachment", attachment)
                    processed_attachments.append(TodoFuncs.create_signed_url(attachment))
                else:
                    print("attachment", attachment)
                    processed_attachments.append("")


            item[TODO.ATTACHMENTS] = processed_attachments

    for todo in todolist_data:
        if not isinstance(todo.get('attachments', []), list):
            todo['attachments'] = [todo['attachments']]
    return [TodoResponsModel(**todo) for todo in todolist_data]
