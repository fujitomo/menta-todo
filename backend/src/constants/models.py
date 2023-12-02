import json
from datetime import date, datetime
from typing import List, Optional

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
    title: Optional[str] = None
    description: Optional[str] = None
    date_start: Optional[date] = None
    date_end: Optional[date] = None
    tags: Optional[List[str]] = None
    color: Optional[str] = None
    current_state: Optional[TODO_STATE] = None

    class Config:
        orm_mode = True


class TodoListRequestModel(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags_existence: Optional[bool] = None
    tag: Optional[List[str]] = None
    attachments_existence: Optional[bool] = None
    color: Optional[str] = None
    work_date: Optional[date] = None
    completed_date_start: Optional[date] = None
    completed_date_end: Optional[date] = None
    create_date_start: Optional[date] = None
    create_date_end: Optional[date] = None
    current_state: Optional[TODO_STATE] = None


class TodoUpdateRequestModel(TodoRequestModel):
    todo_id: str


class TodoResponsModel(BaseModel):
    user_id: Optional[str] = None
    todo_id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    date_start: Optional[date] = None
    date_end: Optional[date] = None
    tags: Optional[List[str]] = None
    attachments: Optional[List[Optional[str]]] = None
    color: Optional[str] = None
    current_state: Optional[TODO_STATE] = None
    completed_date: Optional[date] = None
    create_date: Optional[datetime] = None
