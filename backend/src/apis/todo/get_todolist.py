
from typing import List, Optional

from constants import BasicResponses, Endpoints, Tags
from constants.models import TodoListRequestModel, TodoResponsModel
from constants.other import COLLLECTION, ERROR_MESSAGE, REGISTRANT, TODO
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import (APIRouter, Depends, FastAPI, Header, HTTPException,
                     Request, status)
from fastapi.security import HTTPBearer
from funcs import AuthFuncs, DbFuncs, ExceptionFuncs, UtilFuncs
from funcs.util_funcs import UtilFuncs
from pydantic import BaseModel

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
async def endpoint(
    request: Request,
    request_model: TodoListRequestModel,
    db: AsyncIOMotorDatabase = Depends(DbFuncs.get_database),
):
    # DBのコレクションを定義
    collection = db[COLLLECTION.TODO]
    token_info: AuthFuncs.TokenPayload = request.state.token_info

    search = {}

    search[TODO.USER_ID] = token_info.user_id

    if request_model.title:
        # NoSQLインジェクション対策: 正規表現パターンをエスケープ
        sanitized_title = UtilFuncs.sanitize_string_input(request_model.title, max_length=200)
        escaped_title = UtilFuncs.escape_regex_pattern(sanitized_title)
        regex_pattern = f".*{escaped_title}.*"
        search[TODO.TITLE] = {"$regex": regex_pattern, "$options": "i"}

    if request_model.description:
        # NoSQLインジェクション対策: 正規表現パターンをエスケープ
        sanitized_description = UtilFuncs.sanitize_string_input(request_model.description, max_length=500)
        escaped_description = UtilFuncs.escape_regex_pattern(sanitized_description)
        regex_pattern = f".*{escaped_description}.*"
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
            if request_model.tag:
                # NoSQLインジェクション対策: タグリストの各要素をサニタイズ
                sanitized_tags = [
                    UtilFuncs.sanitize_string_input(tag, max_length=50)
                    for tag in request_model.tag
                ]
                search[TODO.TAGS] = {"$all": sanitized_tags}
            else:
                search["tags.0"] = {"$exists": True}
        else:
            search["tags.0"] = {"$exists": False}

    if request_model.current_state:
        search[TODO.CURRENT_STATE] = request_model.current_state.value

    if request_model.color:
        # NoSQLインジェクション対策: カラーコードをサニタイズ
        sanitized_color = UtilFuncs.sanitize_string_input(request_model.color, max_length=20)
        search[TODO.COLOR] = sanitized_color

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


    return [TodoResponsModel(**todo) for todo in todolist_data]
