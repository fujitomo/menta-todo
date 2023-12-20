import hashlib
import imghdr
import io
import os
import re
from typing import Optional
from constants import env

import boto3
from constants.other import ERROR_MESSAGE
from funcs.exception_funcs import ExceptionFuncs
from PIL import Image

path = './'
filelist = os.listdir(path)

class config:

    S3_BUCKET_NAME = env.S3_BUCKET_NAME

    AWS_CLOUDFRONT_URL = env.AWS_CLOUDFRONT_URL

    AWS_ACCESS_KEY_ID = env.ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY = env.SECRET_ACCESS_KEY
    AWS_REGION_NAME = env.AWS_REGION_NAME


IMG_RE = re.compile(r'image/(png|jpe?g|gif|svg)')


class FileManager:

    @staticmethod
    def is_image_content_type(content_type: Optional[str]) -> bool:
        if not content_type:
            return False
        return IMG_RE.match(content_type.lower()) is not None

    @staticmethod
    def image_format(binary: bytes):
        img = Image.open(io.BytesIO(binary))
        fmt = img.format
        content_type = f"image/{fmt.lower()}" if fmt else None

        if FileManager.is_image_content_type(content_type):
            return content_type, fmt
        else:
            ExceptionFuncs.raise_bad_request(ERROR_MESSAGE.EXTENSION)

    @staticmethod
    def hash_binary_to_md5(binary: bytes):
        return hashlib.md5(binary).hexdigest()

    def __init__(self):

        self.aws_cloudfront_url = config.AWS_CLOUDFRONT_URL

        self.aws_access_key_id = config.AWS_ACCESS_KEY_ID
        self.aws_secret_access_key = config.AWS_SECRET_ACCESS_KEY
        self.aws_region_name = config.AWS_REGION_NAME

        self.s3_bucket_name = config.S3_BUCKET_NAME

        self.boto3_client_s3 = boto3.client(
            "s3",
            aws_access_key_id=self.aws_access_key_id,
            aws_secret_access_key=self.aws_secret_access_key,
            region_name=self.aws_region_name,
        )

    def upload(self, binary: bytes, folder: str):

        try:
            content_type, fmt = FileManager.image_format(binary)
            hashed_binary = FileManager.hash_binary_to_md5(binary)

            server_path = f'{folder}/{hashed_binary}.{fmt}'
            self.boto3_client_s3.upload_fileobj(
             Fileobj=io.BytesIO(binary),
             Bucket=self.s3_bucket_name,
             Key=server_path,
             ExtraArgs={
               'ContentType': content_type
             } if content_type else {}
            )
            server_path = f'{folder}/{hashed_binary}.{fmt}'
            return f"{self.aws_cloudfront_url}/{server_path}"

        except Exception as e:
            print(e)
            return None

    def delete(self, folder: str, filename: str):
        try:

            file_path = f"{folder}/{filename}"
            return FileManager.delete(file_path)

        except Exception:
            return False

    def delete(self, fullpath: str):
        try:

            boto3_resorce_s3 = boto3.resource(
                "s3",
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key,
                region_name=self.aws_region_name,
            )
            file_path = f"{fullpath}"
            s3_object = boto3_resorce_s3.Object(self.s3_bucket_name, file_path)
            s3_object.delete()
            return True

        except Exception:
            return False

    def deleteS3Folder(self, folder: str):
        try:
            boto3_resorce_s3 = boto3.resource(
                "s3",
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key,
                region_name=self.aws_region_name,
            )
            bucket = boto3_resorce_s3.Bucket(self.s3_bucket_name)
            bucket.objects.filter(Prefix=folder).delete()
            return True

        except Exception:
            return False
