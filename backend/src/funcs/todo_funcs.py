import os
import re
from typing import List
from urllib.parse import urlparse

from constants.models import TodoRequestModel
from constants.other import SETTINGS, TODO, TODO_STATE
from fastapi import UploadFile
from funcs.upload_file import FileManager

from .exception_funcs import ExceptionFuncs


class TodoFuncs:

    @staticmethod
    async def check_tododata(
        attachments: List[UploadFile],
        todo_model: TodoRequestModel
    ) -> str:

        if attachments:
            if len(attachments) > 10:
                ExceptionFuncs.raise_bad_request("アップロードファイルが5つより多いです。")

            for attachment in attachments:
                attachments_bytes = await attachment.read()
                if len(attachments_bytes) > SETTINGS.MAX_UPLOADFILE_SIZE:
                    ExceptionFuncs.raise_entity_too_large("アップロードファイルに2MBより大きいものがあります。")

        if todo_model:
            if len(todo_model.title) > 500:
                ExceptionFuncs.raise_bad_request(
                    f"カラム「{TODO.TITLE}」の文字数が500文字より多いです。")
        if todo_model.description:
            if len(todo_model.description) > 2000:
                ExceptionFuncs.raise_bad_request(
                    f"カラム「{TODO.DESCRIPTION}」の文字数が2000文字より多いです。")

        if todo_model.tags:
            if len(todo_model.tags) > 10:
                ExceptionFuncs.raise_bad_request(
                    f"カラム「{TODO.TAGS}」の登録数が10個より多いです。")
            for tag in todo_model.tags:
                if len(tag) > 10:
                    ExceptionFuncs.raise_bad_request(
                        f"カラム「{TODO.TAGS}」の配列内に文字数が10より多いものがあります。")

        if todo_model.current_state:
            if not TodoFuncs.is_todo_state(todo_model.current_state):
                ExceptionFuncs.raise_bad_request(
                    f"カラム「{TODO.CURRENT_STATE}」が状態選択一覧にない値です。")

        if todo_model.color:
            if not TodoFuncs.is_colorcode_format(todo_model.color):
                ExceptionFuncs.raise_bad_request(
                    f"カラム「{TODO.COLOR}」がカラーコードではないです。")

    @staticmethod
    def is_todo_state(value: str) -> str:
        result = False
        for state in TODO_STATE:
            if state == value:
                result = True
        return result

    # complieすると処理が速い
    repatter_colorcode = re.compile(
        r"^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")

    @staticmethod
    def is_colorcode_format(value: str):
        return TodoFuncs.repatter_colorcode.match(value)

    @staticmethod
    def get_attachments(attachments: List[UploadFile],
                        user_id: str,
                        todo_id: str,
                        old_attachment_list: List[str] = None,
                        old_hash_list: List[str] = None) -> List:

        file_manager = FileManager()
        attachments_up = None
        attachments_hash = None
        attachments_up = []
        attachments_hash = []
        if attachments:
            count = 0
            for attachment in attachments:
                attachment_bytes = attachment.file.read()
                hash = FileManager.hash_binary_to_md5(attachment_bytes)
                if old_hash_list:  # 更新時
                    # 旧ファイルを削除
                    if old_hash_list[count] != hash:
                        url = urlparse(old_attachment_list[count])
                        filename = os.path.basename(url.path)
                        file_manager.delete(f"{user_id}/{SETTINGS.FOLDER_TODO_ATTACHMENTS}/{todo_id}", filename)
                        attachment_up = file_manager.upload(
                                                attachment_bytes,
                                                f"{user_id}/{SETTINGS.FOLDER_TODO_ATTACHMENTS}/{todo_id}")
                else:  # 新規登録時
                    attachment_up = file_manager.upload(
                            attachment_bytes,
                            f"{user_id}/{SETTINGS.FOLDER_TODO_ATTACHMENTS}/{todo_id}"
                        )
                print(attachment_up)
                attachments_up.append(attachment_up)
                attachments_hash.append(hash)
                count += 1
        else:
            # 旧ファイルをすべて削除
            if old_attachment_list:
                for old_objects in zip(old_attachment_list, old_hash_list):
                    url = urlparse(old_objects[0])
                    filename = os.path.basename(url.path)
                    file_manager.delete(f"{user_id}/{SETTINGS.FOLDER_TODO_ATTACHMENTS}/{todo_id}", filename)

        return attachments_up, attachments_hash

    @staticmethod
    def delete_attachments(user_id: str, todo_id: str) -> bool:
        file_manager = FileManager()
        is_delete = file_manager.deleteS3Folder(f"{user_id}/{SETTINGS.FOLDER_TODO_ATTACHMENTS}/{todo_id}")
        return is_delete