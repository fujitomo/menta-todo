from typing import Any, Dict

from fastapi import status
from pydantic import BaseModel, Field


class FailureResponse(BaseModel):
    detail: str = Field(
        description="""
      エラーメッセージ
      """
    )


httpResponsesBasicErrors: Dict[int, Dict[str, Any]] = {
    status.HTTP_400_BAD_REQUEST: {
        "model": FailureResponse,
        "description": "エラーが発生",
    },
    status.HTTP_401_UNAUTHORIZED: {
        "model": FailureResponse,
        "description": "エンドポイント利用条件を満たしていない",
    },
    status.HTTP_504_GATEWAY_TIMEOUT: {
        "model": FailureResponse,
        "description": "タイムアウト",
    },
    status.HTTP_500_INTERNAL_SERVER_ERROR: {
        "model": FailureResponse,
        "description": "不明なエラー",
    },
}


class BasicResponses:
    @staticmethod
    def set_success_model(SuccessResponse):
        return {
            **httpResponsesBasicErrors,
            status.HTTP_200_OK: {"model": SuccessResponse, "description": "成功"}
        }
