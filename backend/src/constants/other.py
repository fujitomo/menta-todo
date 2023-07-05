

from enum import Enum


class COLLLECTION():
    REGISTRANT = "registrant"
    TODO = "todo"


class REGISTRANT():
    USER_ID = "user_id"
    PASSWORD = "password"
    EMAIL = "email"
    EMAIL_UPDATE = "email_update"
    ONETIME_PASSWORD = "onetime_password"
    IS_AUTHENTICATED = "is_authenticated"
    USER_NAME = "user_name"
    BIRTHDAY = "birthday"
    AVATAR_PHOTO = "avatar_photo"
    AVATAR_NAME = "avatar_name"
    NUMBER_VERIFICATION = "number_verification"
    NUMBER_GENRATION = "number_genration"
    CREATE_DATE = "create_date"
    AVATAR_PHOTO_HASH = "avatar_photo_hash"
    UPDATE_DATE = "update_date"
    MAX_NUMBER_GENRATION = 3
    MAX_NUMBER_VERIFICATION = 3
    INIT_NUMBER_VERIFICATION = "000000000"
    MAX_NUMBER_GENRATION = 3
    REFRESH_TOKEN = "refresh_token"
    DELETE_DATE = "delete_date"


class TODO():
    USER_ID = "user_id"
    TODO_ID = "todo_id"
    TITLE = "title"
    DESCRIPTION = "description"
    ATTACHMENTS = "attachments"
    ATTACHMENTS_HASH = "attachments_hash"
    DATE_START = "date_start"
    DATE_END = "date_end"
    TAGS = "tags"
    CURRENT_STATE = "current_state"
    COLOR = "color"
    COMPLETED_DATE = "completed_date"
    DELETE_DATE = "delete_date"
    CREATE_DATE = "create_date"
    UPDATE_DATE = "update_date"


class SETTINGS():
    FOLDER_AVATAR_PHOTO = "1"
    FOLDER_TODO_ATTACHMENTS = "2"
    MAX_UPLOADFILE_SIZE = 2 * 1024 * 1024


class TODO_STATE(Enum):
    FOLDER_PENDING_ATTACHMENT = "保留"
    FOLDER_WORKING_ATTACHMENT = "作業中"
    FOLDER_COMPLETED_ATTACHMENT = "完了"
    FOLDER_WAITING_ATTACHMENT = "待機中"


class EMAIL_MESSAGE():
    AWS_EMAIL_SUBJECT = "ユーザー登録用のご案内"
    AWS_EMAIL_BODY = "ワンタイムパスワードを使用してメールアドレスの認証をしてください。\n有効期限は10分間になります。"\
                     "\n\nワンタイムパスワード：{onePassword}"


class ERROR_MESSAGE():
    INVALID_MAIL_FORMAT = "無効なメールアドレスです。"
    PASSWORD_LIMIT = "passwordは8文字以上、24文字以下で設定するようにしてください。"
    DUPLICATED = "既に登録されています。"
    NOT_FOUND = "データが存在しません。"
    CREATE_FAILED = "登録処理に失敗しました。"
    UPDATE_FAILED = "更新処理に失敗しました。"
    TOKEN_PASSWORD = "トークンとパスワードが無効です。"
    TOKEN_EXPIRED = "トークンは有効期限切れです。"
    TOKEN_AUTHORITY = "このトークンには利用権限がありません。"
    DELETE_FAILED = "削除処理に失敗しました。"
    CERTIFICATION_FAILED = "メールアドレスまたはパスワードが正しくありません"
    INVAID_PASSWORD_FORMAT = "パスワードのフォーマットが正しくありません。"
    EXTENSION = "アップロードするファイルの拡張子に対応していません。"
    ONEPASSWORD_GENERATION = "ワンタイムパスワードの1日あたの生成回数上限に達しています。"
    ONEPASSWORD_INSPECTION = "ワンタイムパスワードの1日あたの検証回数上限に達しています。"
    PASSWORD_BEFORE = "変更前パスワードが違います。"


class SUCCESS_MESSAGE():
    CREATE = "登録完了しました。"
    UPDATE = "更新完了しました。"
    DELETE = "更新完了しました。"
    ONETIMEPASSWORD = "ワンタイムパスワード発行に成功しました。"
