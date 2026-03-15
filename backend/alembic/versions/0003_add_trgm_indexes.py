"""add trigram indexes for ILIKE search

Revision ID: 0003
Revises: 0002
Create Date: 2026-03-15

"""

from typing import Sequence, Union

from alembic import op

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # clients
    op.create_index(
        "ix_clients_name_trgm", "clients", ["name"],
        postgresql_using="gin",
        postgresql_ops={"name": "gin_trgm_ops"},
    )
    op.create_index(
        "ix_clients_email_trgm", "clients", ["email"],
        postgresql_using="gin",
        postgresql_ops={"email": "gin_trgm_ops"},
    )

    # technicians
    op.create_index(
        "ix_technicians_name_trgm", "technicians", ["name"],
        postgresql_using="gin",
        postgresql_ops={"name": "gin_trgm_ops"},
    )
    op.create_index(
        "ix_technicians_email_trgm", "technicians", ["email"],
        postgresql_using="gin",
        postgresql_ops={"email": "gin_trgm_ops"},
    )

    # work_orders
    op.create_index(
        "ix_work_orders_title_trgm", "work_orders", ["title"],
        postgresql_using="gin",
        postgresql_ops={"title": "gin_trgm_ops"},
    )


def downgrade() -> None:
    op.drop_index("ix_work_orders_title_trgm", "work_orders")
    op.drop_index("ix_technicians_email_trgm", "technicians")
    op.drop_index("ix_technicians_name_trgm", "technicians")
    op.drop_index("ix_clients_email_trgm", "clients")
    op.drop_index("ix_clients_name_trgm", "clients")
