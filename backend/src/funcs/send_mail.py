import asyncio
import email.utils
import logging
import smtplib
from concurrent.futures import ThreadPoolExecutor
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from constants import env

logger = logging.getLogger(__name__)

# メール送信用のスレッドプール（最大3ワーカー）
_email_executor = ThreadPoolExecutor(max_workers=3, thread_name_prefix="email_sender")

AWSMAIL_HOST = env.AWSMAIL_HOST
AWSMAIL_PORT = 587
AWSMAIL_ID = env.SMTP_USERNAME
AWSMAIL_PASSWORD = env.SMTP_PASSWORD

FROM_NAME = env.FROM_NAME
FROM_EMAIL = env.FROM_EMAIL


def _send_mail_aws_sync(
    subject: str,
    to_email: str,
    body: str,
):
    """
    同期的なメール送信関数（内部使用）
    スレッドプールで実行される
    注意: FROM_EMAILの検証は非同期関数側で既に実施済み
    """
    logger.debug(f"メール送信を試みます: 送信元: {FROM_EMAIL} → 送信先: {to_email}")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = email.utils.formataddr((FROM_NAME, FROM_EMAIL))
    msg["To"] = to_email
    msg.attach(
        MIMEText(
            body.replace("<br>", "").replace("<br/>", "").replace("<br />", ""), "plain"
        )
    )

    # SMTPサーバーに接続
    server = smtplib.SMTP(AWSMAIL_HOST, AWSMAIL_PORT)
    # デバッグモードは環境変数で制御（本番環境では無効推奨）
    if env.DEBUG_MODE:
        server.set_debuglevel(1)  # デバッグモードを有効化

    try:
        logger.debug(f"SMTPサーバーに接続中: {AWSMAIL_HOST}:{AWSMAIL_PORT}")
        ehlo_response = server.ehlo()
        logger.debug(f"EHLO応答: {ehlo_response}")

        starttls_response = server.starttls()
        logger.debug(f"STARTTLS応答: {starttls_response}")

        ehlo_response2 = server.ehlo()
        logger.debug(f"STARTTLS後のEHLO応答: {ehlo_response2}")

        logger.debug(f"ログイン試行中: ユーザー名: {AWSMAIL_ID}")
        login_response = server.login(AWSMAIL_ID, AWSMAIL_PASSWORD)
        logger.debug(f"ログイン応答: {login_response}")

        logger.debug(f"メール送信中: 送信元 {FROM_EMAIL} → 送信先 {to_email}")
        logger.debug(f"件名: {subject}")
        sendmail_response = server.sendmail(FROM_EMAIL, to_email, msg.as_string())
        logger.debug(f"送信応答: {sendmail_response}")

        # sendmail()の戻り値が空の辞書の場合、すべての受信者が受け入れられたことを意味する
        if sendmail_response:
            logger.warning(f"一部の受信者が拒否されました: {sendmail_response}")
        else:
            logger.info(f"メール送信成功: 送信元 {FROM_EMAIL} → 送信先 {to_email}")

    except smtplib.SMTPRecipientsRefused as e:
        logger.error(f"SMTP受信者拒否エラー: {e}")
        logger.error(f"送信元: '{FROM_EMAIL}', 送信先: '{to_email}'")
        logger.error(
            "通常、これはAWS SESサンドボックスモードで送信先メールアドレスが検証されていないことを意味します"
        )
        raise
    except smtplib.SMTPSenderRefused as e:
        logger.error(f"SMTP送信者拒否エラー: {e}")
        logger.error(
            f"送信元: '{FROM_EMAIL}' - このメールアドレスがAWS SESで検証されていない可能性があります"
        )
        raise
    except smtplib.SMTPDataError as e:
        logger.error(f"SMTPデータエラー: {e}")
        logger.error("サーバーによってメールの内容が拒否された可能性があります")
        raise
    except Exception as e:
        logger.exception(f"メール送信エラー: {type(e).__name__}: {e}")
        logger.error(f"送信元: '{FROM_EMAIL}', 送信先: '{to_email}'")
        raise
    finally:
        server.quit()  # close()ではなくquit()を使用
        logger.debug("SMTP接続を閉じました")


async def send_mail_aws(
    subject: str,
    to_email: str,
    body: str,
):
    """
    非同期メール送信関数
    ブロッキングI/Oをスレッドプールで実行し、イベントループをブロックしない
    """
    # FROM_EMAILの検証（非同期処理の前に実行）
    if not FROM_EMAIL or FROM_EMAIL.strip() == "":
        logger.error(
            f"エラー: FROM_EMAILが空または設定されていません。現在の値: '{FROM_EMAIL}'"
        )
        raise ValueError(
            "FROM_EMAILは環境変数で設定する必要がありますが、設定されていません"
        )

    # FROM_EMAILの形式チェック（簡易版）
    if "@" not in FROM_EMAIL or "." not in FROM_EMAIL.split("@")[1]:
        logger.error(f"エラー: FROM_EMAILの形式が無効です。現在の値: '{FROM_EMAIL}'")
        raise ValueError(f"無効なFROM_EMAIL形式: '{FROM_EMAIL}'")

    logger.info(f"メール送信を試みます: 送信元: {FROM_EMAIL} → 送信先: {to_email}")

    # スレッドプールで同期的なメール送信を実行
    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(
            _email_executor,
            _send_mail_aws_sync,
            subject,
            to_email,
            body,
        )
        logger.info(f"メール送信成功: 送信元 {FROM_EMAIL} → 送信先 {to_email}")
    except Exception as e:
        logger.error(f"メール送信エラー: {type(e).__name__}: {e}")
        raise
