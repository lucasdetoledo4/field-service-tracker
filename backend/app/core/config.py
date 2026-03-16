from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/field_service"
    SENTRY_DSN: str | None = None
    LOG_LEVEL: str = "INFO"
    LOG_JSON: bool = True

    model_config = {"env_file": ".env"}


settings = Settings()
