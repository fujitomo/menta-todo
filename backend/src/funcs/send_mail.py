import email.utils
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

AWSMAIL_HOST = "email-smtp.ap-northeast-3.amazonaws.com"
AWSMAIL_PORT = 587

data = [line.split(',') for line in open(
       'funcs/cryptopics-email-credentials.csv', 'r')]

AWSMAIL_ID = data[1][1]
AWSMAIL_PASSWORD = data[1][2]

FROM_NAME = "ふじシステム"
FROM_EMAIL = "fujitomo375@gmail.com"


def send_mail_aws(
    subject: str,
    to_email: str,
    body: str,
):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = email.utils.formataddr((FROM_NAME, FROM_EMAIL))
    msg["To"] = to_email
    msg.attach(MIMEText(body.replace("<br>", "")
                            .replace("<br/>", "")
                            .replace("<br />", ""), "plain"))

    server = smtplib.SMTP(AWSMAIL_HOST, AWSMAIL_PORT)

    try:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(AWSMAIL_ID, AWSMAIL_PASSWORD)
        server.sendmail(FROM_EMAIL, to_email, msg.as_string())
    except Exception as e:
        print("Error: ", e)
    finally:
        server.close()
