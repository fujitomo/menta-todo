FROM python:3.8

WORKDIR /src

RUN pip install --upgrade pip
RUN pip install uvicorn pydantic==1.10.11 requests fastapi python-multipart pyjwt motor pymongo Image boto3 Pillow fastapi_jwt_auth boto3 cryptography botocore

EXPOSE 8000

CMD ["uvicorn", "app:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
