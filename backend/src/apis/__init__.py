import fastapi
from apis.auth import routers as auth_routers
from apis.todo import routers as todo_routers
from constants.endpoints import Endpoints
from fastapi.openapi.utils import get_openapi

routers = fastapi.APIRouter()

routers.include_router(auth_routers)
routers.include_router(todo_routers)
