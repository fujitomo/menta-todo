import logging
import os
import re
from datetime import datetime, timedelta
from typing import List, Tuple
from urllib.parse import urlparse

from botocore.exceptions import ClientError
from constants import env
from constants.models import TodoRequestModel
from constants.other import ERROR_MESSAGE, SETTINGS, TODO, TODO_STATE
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from fastapi import HTTPException, UploadFile

from funcs.upload_file import FileManager

from .exception_funcs import ExceptionFuncs

logger = logging.getLogger(__name__)


class TodoFuncs:
    @staticmethod
    async def check_tododata(
        attachments: List[UploadFile], todo_model: TodoRequestModel
    ) -> str:
        if attachments:
            if len(attachments) > 10:
                ExceptionFuncs.raise_bad_request(
                    "アップロードファイルが5つより多いです。"
                )

            for attachment in attachments:
                attachments_bytes = await attachment.read()
                if len(attachments_bytes) > SETTINGS.MAX_UPLOADFILE_SIZE:
                    ExceptionFuncs.raise_entity_too_large(
                        "アップロードファイルに2MBより大きいものがあります。"
                    )

        if todo_model:
            if len(todo_model.title) > 500:
                ExceptionFuncs.raise_bad_request(
                    f"カラム「{TODO.TITLE}」の文字数が500文字より多いです。"
                )
        if todo_model.description:
            if len(todo_model.description) > 2000:
                ExceptionFuncs.raise_bad_request(
                    f"カラム「{TODO.DESCRIPTION}」の文字数が2000文字より多いです。"
                )

        if todo_model.tags:
            if len(todo_model.tags) > 10:
                ExceptionFuncs.raise_bad_request(
                    f"カラム「{TODO.TAGS}」の登録数が10個より多いです。"
                )
            for tag in todo_model.tags:
                if len(tag) > 10:
                    ExceptionFuncs.raise_bad_request(
                        f"カラム「{TODO.TAGS}」の配列内に文字数が10より多いものがあります。"
                    )

        if todo_model.current_state:
            if not TodoFuncs.is_todo_state(todo_model.current_state):
                ExceptionFuncs.raise_bad_request(
                    f"カラム「{TODO.CURRENT_STATE}」が状態選択一覧にない値です。"
                )

        if todo_model.color:
            if not TodoFuncs.is_colorcode_format(todo_model.color):
                ExceptionFuncs.raise_bad_request(
                    f"カラム「{TODO.COLOR}」がカラーコードではないです。"
                )

    @staticmethod
    def is_todo_state(value: str) -> str:
        result = False
        for state in TODO_STATE:
            if state == value:
                result = True
        return result

    # complieすると処理が速い
    repatter_colorcode = re.compile(r"^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")

    @staticmethod
    def is_colorcode_format(value: str):
        return TodoFuncs.repatter_colorcode.match(value)

    @staticmethod
    def _s3_key_from_cdn_url(cdn_url: str) -> str:
        return (urlparse(cdn_url).path or "").lstrip("/")

    @staticmethod
    def _rollback_s3_uploads(file_manager: FileManager, uploaded_cdn_urls: List[str]) -> None:
        for url in reversed(uploaded_cdn_urls):
            key = TodoFuncs._s3_key_from_cdn_url(url)
            if not key:
                continue
            try:
                file_manager.delete(key)
            except Exception:
                logger.exception("Rollback: failed to delete S3 object (key=%s)", key)

    @staticmethod
    def get_attachments(
        attachments: List[UploadFile],
        user_id: str,
        todo_id: str,
        old_attachment_list: List[str] = None,
        old_hash_list: List[str] = None,
    ) -> Tuple[List, List]:
        file_manager = FileManager()
        attachments_up = []
        attachments_hash = []
        folder_prefix = f"{user_id}/{SETTINGS.FOLDER_TODO_ATTACHMENTS}/{todo_id}"

        def upload_file(attachment):
            for attempt in range(2):
                try:
                    attachment.file.seek(0)
                    attachment_bytes = attachment.file.read()
                    file_hash = FileManager.hash_binary_to_md5(attachment_bytes)
                    attachment_up = file_manager.upload(attachment_bytes, folder_prefix)
                    return attachment_up, file_hash
                except HTTPException:
                    raise
                except ClientError:
                    if attempt == 0:
                        logger.warning(
                            "S3 upload ClientError, retrying once (user_id=%s todo_id=%s filename=%s)",
                            user_id,
                            todo_id,
                            getattr(attachment, "filename", ""),
                        )
                        continue
                    logger.exception(
                        "S3 upload failed after retry (user_id=%s todo_id=%s filename=%s)",
                        user_id,
                        todo_id,
                        getattr(attachment, "filename", ""),
                    )
                    ExceptionFuncs.raise_internal_server_error(ERROR_MESSAGE.CREATE_FAILED)
                except Exception:
                    logger.exception(
                        "Todo attachment upload failed (user_id=%s todo_id=%s filename=%s)",
                        user_id,
                        todo_id,
                        getattr(attachment, "filename", ""),
                    )
                    ExceptionFuncs.raise_internal_server_error(ERROR_MESSAGE.CREATE_FAILED)

        if attachments:
            uploaded_cdn_urls: List[str] = []
            try:
                for count, attachment in enumerate(attachments):
                    attachment_up, file_hash = upload_file(attachment)
                    uploaded_cdn_urls.append(attachment_up)
                    if (
                        old_hash_list
                        and count < len(old_hash_list)
                        and old_hash_list[count] != file_hash
                    ):
                        # 旧ファイルの削除
                        try:
                            url = urlparse(old_attachment_list[count])
                            filename = os.path.basename(url.path)
                            file_manager.delete(f"{folder_prefix}/{filename}")
                        except Exception:
                            logger.exception(
                                "S3 delete failed for old attachment (user_id=%s todo_id=%s)",
                                user_id,
                                todo_id,
                            )

                    attachments_up.append(attachment_up)
                    attachments_hash.append(file_hash)
            except HTTPException:
                TodoFuncs._rollback_s3_uploads(file_manager, uploaded_cdn_urls)
                raise

        elif old_attachment_list:
            # 旧ファイルの削除
            for old_attachment in old_attachment_list:
                try:
                    url = urlparse(old_attachment)
                    filename = os.path.basename(url.path)
                    file_manager.delete(
                        f"{user_id}/{SETTINGS.FOLDER_TODO_ATTACHMENTS}/{todo_id}/{filename}"
                    )
                except Exception:
                    logger.exception(
                        "S3 delete failed for old attachment (user_id=%s todo_id=%s)",
                        user_id,
                        todo_id,
                    )

        return attachments_up, attachments_hash

    @staticmethod
    def delete_attachments(user_id: str, todo_id: str) -> bool:
        file_manager = FileManager()
        is_delete = file_manager.deleteS3Folder(
            f"{user_id}/{SETTINGS.FOLDER_TODO_ATTACHMENTS}/{todo_id}"
        )
        return is_delete
