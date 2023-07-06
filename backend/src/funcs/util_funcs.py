import datetime
import uuid


class UtilFuncs:

    @staticmethod
    def get_now_isodatetime() -> datetime:
        tz = datetime.timezone(datetime.timedelta(hours=9))
        now = datetime.datetime.now(tz)
        result = now.isoformat()
        return result

    def get_now_isodate() -> datetime.date:
        now = datetime.datetime.utcnow()
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
