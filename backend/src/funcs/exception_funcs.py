from fastapi import HTTPException, status


class ExceptionFuncs:
    @staticmethod
    def raise_bad_request(message: str):
        print(message)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )

    @staticmethod
    def raise_unauthorized(message: str):
        print(message)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
        )

    @staticmethod
    def raise_not_found(message: str):
        print(message)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=message,
        )

    @staticmethod
    def raise_conflict(message: str):
        print(message)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=message,
        )

    @staticmethod
    def raise_entity_too_large(message: str):
        print(message)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=message,
        )

    @staticmethod
    def raise_timeout(message: str):
        print(message)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=message,
        )

    @staticmethod
    def raise_internal_server_error(message: str):
        print(message)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=message,
        )
