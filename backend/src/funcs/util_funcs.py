import re
import uuid
from datetime import datetime, timedelta, timezone

from botocore.signers import CloudFrontSigner
from constants import env
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding


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
        cloudfront_signer = CloudFrontSigner(key_id, UtilFuncs.rsa_signer)
        signed_url = cloudfront_signer.generate_presigned_url(
            url, date_less_than=expire_date
        )
        return signed_url

    @staticmethod
    def rsa_signer(message):
        with open(env.AWS_CLOUDFRONT_PEM, "rb") as key_file:
            private_key = serialization.load_pem_private_key(
                key_file.read(), password=None, backend=default_backend()
            )
        return private_key.sign(message, padding.PKCS1v15(), hashes.SHA1())

    @staticmethod
    def escape_regex_pattern(pattern: str) -> str:
        """
        MongoDBの$regexで使用する前に、正規表現の特殊文字をエスケープ
        NoSQLインジェクション対策
        """
        if not isinstance(pattern, str):
            raise ValueError("Pattern must be a string")
        # 正規表現の特殊文字をエスケープ
        return re.escape(pattern)

    @staticmethod
    def sanitize_string_input(value: str, max_length: int = 1000) -> str:
        """
        文字列入力をサニタイズ（MongoDBオペレータインジェクション対策）
        - 辞書型やリスト型の入力を拒否
        - 長さ制限を適用
        """
        if not isinstance(value, str):
            raise ValueError("Input must be a string")
        if len(value) > max_length:
            raise ValueError(f"Input length exceeds maximum of {max_length} characters")
        # MongoDBオペレータが含まれていないかチェック（基本的な検証）
        # 実際のクエリでは、値は直接使用せず、常にフィールド名と値のペアとして使用されるため、
        # この関数は主に型チェックと長さ制限のため
        return value.strip()
