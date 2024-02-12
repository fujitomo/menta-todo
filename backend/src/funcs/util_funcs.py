import uuid
from constants import env
from botocore.signers import CloudFrontSigner


from datetime import datetime, timedelta, timezone

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from constants import env

class UtilFuncs:

    @staticmethod
    def get_now_isodatetime() -> str:
        # タイムゾーンを設定
        tz = timezone(timedelta(hours=9))
        # 現在の日時を取得し、タイムゾーンを適用
        now = datetime.now(tz)
        # ISO 8601 形式の文字列に変換
        result = now.isoformat()
        return result

    def get_now_isodate() -> datetime.date:
        now = datetime.utcnow()
        result = now.date().isoformat()
        return result

    @staticmethod
    def get_uniqueid() -> str:
        return str(uuid.uuid4())

    @staticmethod
    def get_date_isoformat(value: datetime.date):
        if not value:
            return None
        else:
            return value.isoformat()

    @staticmethod
    def create_signed_url(url):
        key_id = env.AWS_CLOUDFRONT_KEY
        expire_date = datetime.utcnow() + timedelta(minutes=3)
        cloudfront_signer = CloudFrontSigner(key_id,UtilFuncs.rsa_signer)
        signed_url = cloudfront_signer.generate_presigned_url(
            url, date_less_than=expire_date)
        return signed_url

    @staticmethod
    def rsa_signer(message):
        with open(env.AWS_CLOUDFRONT_PEM, 'rb') as key_file:
            private_key = serialization.load_pem_private_key(
                key_file.read(),
                password=None,
                backend=default_backend()
            )
        return private_key.sign(message, padding.PKCS1v15(), hashes.SHA1())


