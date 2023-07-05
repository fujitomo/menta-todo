import json
from datetime import date, datetime
from typing import List, Union

from constants.other import TODO_STATE
from pydantic import BaseModel


class MultiPartModel(BaseModel):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate_to_json

    @classmethod
    def validate_to_json(cls, value):
        if isinstance(value, str):
            return cls(**json.loads(value))
        return value


class TodoRequestModel(MultiPartModel):
    title: Union[str, None] = None
    description: Union[str, None] = None
    date_start: Union[date, None] = None
    date_end: Union[date, None] = None
    tags: Union[List[str], None] = None
    color: Union[str, None] = None
    current_state: Union[TODO_STATE, None] = None

    class Config:
        orm_mode = True


class TodoListRequestModel(BaseModel):
    title: Union[str, None] = None
    description: Union[str, None] = None
    tags_existence: Union[bool, None] = None
    tag: Union[str, None] = None
    attachments_existence: Union[bool, None] = None
    color: Union[str, None] = None
    work_date: Union[date, None] = None
    completed_date_start: Union[date, None] = None
    completed_date_end: Union[date, None] = None
    create_date_start: Union[date, None] = None
    create_date_end: Union[date, None] = None
    current_state: Union[TODO_STATE, None] = None


class TodoUpdateRequestModel(TodoRequestModel):
    todo_id: str


class TodoResponsModel(BaseModel):
    user_id: Union[str, None] = None
    todo_id: Union[str, None] = None
    title: Union[str, None] = None
    description: Union[str, None] = None
    date_start: Union[date, None] = None
    date_end: Union[date, None] = None
    tags: Union[List[str], None] = None
    attachments: Union[List[str], None] = None
    color: Union[str, None] = None
    current_state: Union[TODO_STATE, None] = None
    completed_date: Union[date, None] = None
    create_date: Union[datetime, None] = None
