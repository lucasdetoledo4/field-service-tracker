"""add indexes

Revision ID: 0002
Revises: 0001
Create Date: 2026-03-15

"""

from typing import Sequence, Union

from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # clients
    op.create_index("ix_clients_name", "clients", ["name"])
    op.create_index("ix_clients_created_at", "clients", ["created_at"])

    # technicians
    op.create_index("ix_technicians_name", "technicians", ["name"])
    op.create_index("ix_technicians_is_active", "technicians", ["is_active"])
    op.create_index("ix_technicians_created_at", "technicians", ["created_at"])

    # work_orders
    op.create_index("ix_work_orders_title", "work_orders", ["title"])
    op.create_index("ix_work_orders_status", "work_orders", ["status"])
    op.create_index("ix_work_orders_priority", "work_orders", ["priority"])
    op.create_index("ix_work_orders_client_id", "work_orders", ["client_id"])
    op.create_index("ix_work_orders_technician_id", "work_orders", ["technician_id"])
    op.create_index("ix_work_orders_scheduled_at", "work_orders", ["scheduled_at"])
    op.create_index("ix_work_orders_created_at", "work_orders", ["created_at"])

    # work_order_status_history
    op.create_index("ix_work_order_status_history_work_order_id", "work_order_status_history", ["work_order_id"])
    op.create_index("ix_work_order_status_history_created_at", "work_order_status_history", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_work_order_status_history_created_at", "work_order_status_history")
    op.drop_index("ix_work_order_status_history_work_order_id", "work_order_status_history")

    op.drop_index("ix_work_orders_created_at", "work_orders")
    op.drop_index("ix_work_orders_scheduled_at", "work_orders")
    op.drop_index("ix_work_orders_technician_id", "work_orders")
    op.drop_index("ix_work_orders_client_id", "work_orders")
    op.drop_index("ix_work_orders_priority", "work_orders")
    op.drop_index("ix_work_orders_status", "work_orders")
    op.drop_index("ix_work_orders_title", "work_orders")

    op.drop_index("ix_technicians_created_at", "technicians")
    op.drop_index("ix_technicians_is_active", "technicians")
    op.drop_index("ix_technicians_name", "technicians")

    op.drop_index("ix_clients_created_at", "clients")
    op.drop_index("ix_clients_name", "clients")
