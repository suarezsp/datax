"""Change alert.status to String

Revision ID: 40dc06e7bbac
Revises: 0001_initial
Create Date: 2025-11-02 23:28:52.959615
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# Revision identifiers
revision: str = "40dc06e7bbac"
down_revision: Union[str, Sequence[str], None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema — change 'status' from Boolean/Integer to String."""
    with op.batch_alter_table("alerts", schema=None) as batch_op:
        batch_op.alter_column(
            "status",
            existing_type=sa.Boolean(),  # o sa.Integer() según tu modelo anterior
            type_=sa.String(length=50),
            existing_nullable=True,
        )

    # ✅ No borramos índices ni tablas.
    # Los 'drop_index' originales causaban errores por inexistencia.


def downgrade() -> None:
    """Downgrade schema — revert 'status' back to Boolean."""
    with op.batch_alter_table("alerts", schema=None) as batch_op:
        batch_op.alter_column(
            "status",
            existing_type=sa.String(length=50),
            type_=sa.Boolean(),
            existing_nullable=True,
        )