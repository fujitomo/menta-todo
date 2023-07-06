import fastapi

from .create_todo import router as create_todo
from .delete_todo import router as delete_todo
from .get_todo import router as get_todo
from .get_todolist import router as get_todolist
from .update_todo import router as update_todo

routers = fastapi.APIRouter()

routers.include_router(create_todo)
routers.include_router(update_todo)
routers.include_router(delete_todo)
routers.include_router(get_todo)
routers.include_router(get_todolist)
