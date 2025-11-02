import sys
from pathlib import Path
from logging.config import fileConfig
from alembic import context
from sqlalchemy import engine_from_config, pool
from dotenv import load_dotenv

# === Define project base path ===
BASE_DIR = Path(__file__).resolve().parents[1]  # points to backend/
ROOT_DIR = BASE_DIR.parent  # points to project root (hydra/)
load_dotenv(ROOT_DIR / ".env")

# Ensure backend folder in sys.path (so 'app' can be imported)
sys.path.insert(0, str(BASE_DIR))

# === Alembic Config ===
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name, disable_existing_loggers=False)

# === Import DB base and models ===
from app.core.database import Base, DATABASE_URL  # noqa: E402
from app.models.metric import Metric  # noqa: E402
from app.models.alert import Alert  # noqa: E402

# === Target metadata ===
target_metadata = Base.metadata

# === Run Migrations (Offline/Online) ===
def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        url=DATABASE_URL,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()