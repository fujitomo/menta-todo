import fastapi

from .create_account import router as create_account
from .create_profile import router as create_profile
from .email_authentication import router as email_authentication
from .get_profile import router as get_profile
from .health_check import router as health_check
from .login import router as login
from .update_email import router as update_email
from .update_email_authentication import router as update_email_authentication
from .update_password import router as update_password
from .update_profile import router as update_profile

routers = fastapi.APIRouter()

routers.include_router(health_check)
routers.include_router(login)
routers.include_router(create_account)
routers.include_router(create_profile)
routers.include_router(update_profile)
routers.include_router(get_profile)
routers.include_router(email_authentication)
routers.include_router(update_email_authentication)
routers.include_router(update_email)
routers.include_router(update_password)
