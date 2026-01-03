import email.utils
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from constants import env

AWSMAIL_HOST = env.AWSMAIL_HOST
AWSMAIL_PORT = 587
AWSMAIL_ID = env.SMTP_USERNAME
AWSMAIL_PASSWORD = env.SMTP_PASSWORD

FROM_NAME = env.FROM_NAME
FROM_EMAIL = env.FROM_EMAIL


def send_mail_aws(
    subject: str,
    to_email: str,
    body: str,
):
    # FROM_EMAILの検証
    if not FROM_EMAIL or FROM_EMAIL.strip() == "":
        print(
            f"エラー: FROM_EMAILが空または設定されていません。現在の値: '{FROM_EMAIL}'"
        )
        raise ValueError(
            "FROM_EMAILは環境変数で設定する必要がありますが、設定されていません"
        )

    # FROM_EMAILの形式チェック（簡易版）
    if "@" not in FROM_EMAIL or "." not in FROM_EMAIL.split("@")[1]:
        print(f"エラー: FROM_EMAILの形式が無効です。現在の値: '{FROM_EMAIL}'")
        raise ValueError(f"無効なFROM_EMAIL形式: '{FROM_EMAIL}'")

    print(f"メール送信を試みます: 送信元: {FROM_EMAIL} → 送信先: {to_email}")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = email.utils.formataddr((FROM_NAME, FROM_EMAIL))
    msg["To"] = to_email
    msg.attach(
        MIMEText(
            body.replace("<br>", "").replace("<br/>", "").replace("<br />", ""), "plain"
        )
    )

    # SMTPデバッグを有効化（詳細な通信ログを表示）
    server = smtplib.SMTP(AWSMAIL_HOST, AWSMAIL_PORT)
    server.set_debuglevel(1)  # デバッグモードを有効化

    try:
        print(f"SMTPサーバーに接続中: {AWSMAIL_HOST}:{AWSMAIL_PORT}")
        ehlo_response = server.ehlo()
        print(f"EHLO応答: {ehlo_response}")

        starttls_response = server.starttls()
        print(f"STARTTLS応答: {starttls_response}")

        ehlo_response2 = server.ehlo()
        print(f"STARTTLS後のEHLO応答: {ehlo_response2}")

        print(f"ログイン試行中: ユーザー名: {AWSMAIL_ID}")
        login_response = server.login(AWSMAIL_ID, AWSMAIL_PASSWORD)
        print(f"ログイン応答: {login_response}")

        print(f"メール送信中: 送信元 {FROM_EMAIL} → 送信先 {to_email}")
        print(f"件名: {subject}")
        sendmail_response = server.sendmail(FROM_EMAIL, to_email, msg.as_string())
        print(f"送信応答: {sendmail_response}")

        # sendmail()の戻り値が空の辞書の場合、すべての受信者が受け入れられたことを意味する
        if sendmail_response:
            print(f"警告: 一部の受信者が拒否されました: {sendmail_response}")
        else:
            print(f"メール送信成功: 送信元 {FROM_EMAIL} → 送信先 {to_email}")
            print("注意: メールが届かない場合は、以下を確認してください:")
            print("  1. スパム/迷惑メールフォルダを確認")
            print(
                "  2. AWS SESサンドボックスモード - 送信先メールアドレスが検証されている必要があります"
            )
            print("  3. AWS SESの送信制限を確認")

    except smtplib.SMTPRecipientsRefused as e:
        print(f"SMTP受信者拒否エラー: {e}")
        print(f"送信元: '{FROM_EMAIL}', 送信先: '{to_email}'")
        print(
            "通常、これはAWS SESサンドボックスモードで送信先メールアドレスが検証されていないことを意味します"
        )
        raise
    except smtplib.SMTPSenderRefused as e:
        print(f"SMTP送信者拒否エラー: {e}")
        print(
            f"送信元: '{FROM_EMAIL}' - このメールアドレスがAWS SESで検証されていない可能性があります"
        )
        raise
    except smtplib.SMTPDataError as e:
        print(f"SMTPデータエラー: {e}")
        print("サーバーによってメールの内容が拒否された可能性があります")
        raise
    except Exception as e:
        print(f"メール送信エラー: {type(e).__name__}: {e}")
        print(f"送信元: '{FROM_EMAIL}', 送信先: '{to_email}'")
        raise
    finally:
        server.quit()  # close()ではなくquit()を使用
        print("SMTP接続を閉じました")
