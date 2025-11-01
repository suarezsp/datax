from sqlalchemy import create_engine # conection with database
from sqlalchemy.orm import sessionmaker, declarative_base # sessionmaker - create sessions, declarative_base - base class for models
from app.core.config import settings # import settings from config.py

DATABASE_UL= (
    f"postgresql+psycopg2://{settings.DB_USER}:{settings.DB_PASSWORD}"
    f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
)

engine = create_engine(DATABASE_UL) # create engine
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) # create session local
Base = declarative_base() # create base class for models

def get_db(): # dependency to get db session
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()