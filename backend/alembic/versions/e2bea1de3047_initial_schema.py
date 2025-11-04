"""initial schema (idempotent)"""

from alembic import op
import sqlalchemy as sa

revision = 'e2bea1de3047'
down_revision = '40dc06e7bbac'  
branch_labels = None
depends_on = None

def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if 'metrics' not in tables:
        op.create_table(
            'metrics',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('host', sa.String(255), nullable=False),
            sa.Column('cpu_usage', sa.Float, nullable=False),
            sa.Column('memory_usage', sa.Float, nullable=False),
            sa.Column('latency', sa.Float, nullable=False),
            sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        )
        op.create_index('ix_metrics_id', 'metrics', ['id'], unique=False)
        op.create_index('ix_metrics_host', 'metrics', ['host'], unique=False)

    if 'alerts' not in tables:
        op.create_table(
            'alerts',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('host', sa.String(255), nullable=False),
            sa.Column('type', sa.String(50), nullable=False),
            sa.Column('value', sa.Float, nullable=False),
            sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
            sa.Column('status', sa.String(64), nullable=False),
        )
        op.create_index('ix_alerts_id', 'alerts', ['id'], unique=False)
        op.create_index('ix_alerts_host', 'alerts', ['host'], unique=False)

def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if 'alerts' in tables:
        op.drop_table('alerts')
    if 'metrics' in tables:
        op.drop_table('metrics')