import os
import re
from typing import List, Tuple
from urllib.parse import urlparse
import boto3

from constants.models import TodoRequestModel
from constants.other import SETTINGS, TODO, TODO_STATE
from funcs.upload_file import FileManager
from fastapi import UploadFile
from botocore.exceptions import ClientError
from .exception_funcs import ExceptionFuncs

from datetime import datetime, timedelta

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from botocore.signers import CloudFrontSigner
from constants import env

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
                        old_hash_list: List[str] = None) -> Tuple[List, List]:
        file_manager = FileManager()
        attachments_up = []
        attachments_hash = []

        def upload_file(attachment):
            try:
                attachment.file.seek(0)
                attachment_bytes = attachment.file.read()
                hash = FileManager.hash_binary_to_md5(attachment_bytes)
                attachment_up = file_manager.upload(
                    attachment_bytes, f"{user_id}/{SETTINGS.FOLDER_TODO_ATTACHMENTS}/{todo_id}"
                )
                return attachment_up, hash
            except Exception as e:
                # エラーロギングや適切なエラー処理をここに追加
                pass

        if attachments:
            for count, attachment in enumerate(attachments):
                attachment_up, hash = upload_file(attachment)
                if old_hash_list and count < len(old_hash_list) and old_hash_list[count] != hash:
                    # 旧ファイルの削除
                    try:
                        url = urlparse(old_attachment_list[count])
                        filename = os.path.basename(url.path)
                        file_manager.delete(f"{user_id}/{SETTINGS.FOLDER_TODO_ATTACHMENTS}/{todo_id}", filename)
                    except Exception as e:
                        # エラーロギングや適切なエラー処理をここに追加
                        pass

                attachments_up.append(attachment_up)
                attachments_hash.append(hash)

        elif old_attachment_list:
            # 旧ファイルの削除
            for old_attachment in old_attachment_list:
                try:
                    url = urlparse(old_attachment)
                    filename = os.path.basename(url.path)
                    file_manager.delete(f"{user_id}/{SETTINGS.FOLDER_TODO_ATTACHMENTS}/{todo_id}", filename)
                except Exception as e:
                    # エラーロギングや適切なエラー処理をここに追加
                    pass

        return attachments_up, attachments_hash

    @staticmethod
    def delete_attachments(user_id: str, todo_id: str) -> bool:
        file_manager = FileManager()
        is_delete = file_manager.deleteS3Folder(f"{user_id}/{SETTINGS.FOLDER_TODO_ATTACHMENTS}/{todo_id}")
        return is_delete


    @staticmethod
    def rsa_signer(message):
        with open(env.AWS_CLOUDFRONT_PEM, 'rb') as key_file:
            private_key = serialization.load_pem_private_key(
                key_file.read(),
                password=None,
                backend=default_backend()
            )
        return private_key.sign(message, padding.PKCS1v15(), hashes.SHA1())

    @staticmethod
    def create_signed_url(url):
        key_id = env.AWS_CLOUDFRONT_URL
        expire_date = datetime.utcnow() + timedelta(minutes=60)
        cloudfront_signer = CloudFrontSigner(key_id,TodoFuncs.rsa_signer)
        signed_url = cloudfront_signer.generate_presigned_url(
            url, date_less_than=expire_date)
        return signed_url
