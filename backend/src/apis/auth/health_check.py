from constants import BasicResponses, Endpoints, Tags
from fastapi import APIRouter
from pydantic import BaseModel


class Response(BaseModel):
    result: bool


router = APIRouter()

ENDPOINT = Endpoints.General.health_check
TAGS = [Tags.general]
RESPONSES = BasicResponses.set_success_model(Response)


@router.get(ENDPOINT, tags=TAGS, responses=RESPONSES)
def endpoint():
    return Response(result=True)
