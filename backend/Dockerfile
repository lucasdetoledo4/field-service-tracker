FROM python:3.14-slim
WORKDIR /app
RUN pip install uv
COPY pyproject.toml .
RUN uv sync
COPY . .
ENTRYPOINT ["sh", "entrypoint.sh"]
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
