"""initial create metrics and alerts

Revision ID: 0001_initial
Revises: 
Create Date: 2025-11-02 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # metrics table
    op.create_table(
        'metrics',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('host', sa.String(length=256), nullable=False, index=True),
        sa.Column('cpu_usage', sa.Float, nullable=True),
        sa.Column('memory_usage', sa.Float, nullable=True),
        sa.Column('latency', sa.Float, nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
    )

    # alerts table
    op.create_table(
        'alerts',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('host', sa.String(length=256), nullable=False, index=True),
        sa.Column('type', sa.String(length=256), nullable=False),
        sa.Column('value', sa.Float, nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(length=64), nullable=False, server_default=sa.text("'active'")),
    )

def downgrade():
    op.drop_table('alerts')
    op.drop_table('metrics')