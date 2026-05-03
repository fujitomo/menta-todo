FROM python:3.9

WORKDIR /src

# Poetryをインストール
RUN pip install --upgrade pip && \
    pip install poetry && \
    poetry config virtualenvs.create false

# pyproject.tomlとpoetry.lockをコピー
COPY pyproject.toml poetry.lock* ./

# 依存関係をインストール（プロジェクト自体はインストールしない）
RUN poetry install --no-interaction --no-ansi --no-root

EXPOSE 8000

CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
