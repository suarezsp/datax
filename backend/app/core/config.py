from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2] 

class Settings(BaseSettings):
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    model_config = ConfigDict(
        env_file=str(ROOT_DIR / ".env"),
        env_file_encoding="utf-8"
    )

settings = Settings()