from typing import List

from fastapi.openapi.utils import get_openapi


class Endpoints:
    class General:
        base = "/general"
        health_check = f"{base}/health-check"

    class Auth:
        base = "/auth"
        login = f"{base}/login"
        create_account = f"{base}/create_account"
        email_authentication = f"{base}/email_authentication"
        update_email_authentication = f"{base}/update_email_authentication"
        create_profile = f"{base}/create_profile"
        update_profile = f"{base}/update_profile"
        update_email = f"{base}/update_email"
        update_password = f"{base}/update_password"
        update_profile = f"{base}/update_profile"
        get_profile = f"{base}/get_profile"

    class Todo:
        base = "/todo"
        create_todo = f"{base}/create_todo"
        update_todo = f"{base}/update_todo"
        delete_todo = f"{base}/delete_todo"
        get_todo = f"{base}/get_todo"
        get_todolist = f"{base}/get_todolist"

    @staticmethod
    def get_auth_required_endpoints() -> List[str]:
        auth_required_endpoints = [
            Endpoints.Auth.create_account,
            Endpoints.Auth.update_email,
            Endpoints.Auth.email_authentication,
            Endpoints.Auth.update_email_authentication,
            Endpoints.Auth.create_profile,
            Endpoints.Auth.update_profile,
            Endpoints.Auth.update_email,
            Endpoints.Auth.update_password,
            Endpoints.Auth.get_profile,
            Endpoints.Todo.create_todo,
            Endpoints.Todo.update_todo,
            Endpoints.Todo.delete_todo,
            Endpoints.Todo.get_todo,
            Endpoints.Todo.get_todolist,
        ]
        return auth_required_endpoints


class Tags:
    general = "general"
    auth = "auth"
    todo = "todo"

