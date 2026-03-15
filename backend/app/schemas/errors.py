from app.schemas.base import CustomBaseModel


class FieldError(CustomBaseModel):
    field: str
    message: str


class ErrorResponse(CustomBaseModel):
    detail: str
    errors: list[FieldError] | None = None
