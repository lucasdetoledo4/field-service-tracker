import uuid


class AppError(Exception):
    """Base class for all application-level errors."""


class NotFoundError(AppError):
    def __init__(self, resource: str, id: uuid.UUID) -> None:
        self.resource = resource
        self.id = id
        super().__init__(f"{resource} '{id}' not found")


class InvalidTransitionError(AppError):
    def __init__(self, from_status: str, to_status: str) -> None:
        self.from_status = from_status
        self.to_status = to_status
        super().__init__(f"Cannot transition from '{from_status}' to '{to_status}'")
