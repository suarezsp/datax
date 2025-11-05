import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from app.main import app  
from app.core.database import Base, get_db

from app.core.config import settings

TEST_SQLITE = "sqlite:///:memory:"


@pytest.fixture(scope="session")
def engine():
    engine = create_engine(TEST_SQLITE, connect_args={"check_same_thread": False})
    return engine


@pytest.fixture(scope="session")
def tables(engine):
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session(engine, tables):
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture()
def client(monkeypatch, db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    monkeypatch.setattr("app.core.database.get_db", override_get_db)
    with TestClient(app) as c:
        yield c