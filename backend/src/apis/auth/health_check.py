from constants import BasicResponses, Endpoints, Tags
from fastapi import APIRouter, Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPBearer
from fastapi_jwt_auth import AuthJWT
from pydantic import BaseModel


class Response(BaseModel):
    result: bool


router = APIRouter()

ENDPOINT = Endpoints.General.health_check
TAGS = [Tags.general]
RESPONSES = BasicResponses.set_success_model(Response)

bearer_scheme = HTTPBearer()

@router.get(ENDPOINT, tags=TAGS, responses=RESPONSES, dependencies=[Depends(bearer_scheme)])
def endpoint():
    return Response(result=True)
