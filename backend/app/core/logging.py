from loguru import logger
import sys
from pathlib import Path

LOG_LEVEL = "INFO"

logger.remove()
logger.add(sys.stdout, level=LOG_LEVEL, enqueue=True, backtrace=True, diagnose=False,
           format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>")
# file sink, might delete later
log_dir = Path(__file__).resolve().parents[3] / "logs"
log_dir.mkdir(parents=True, exist_ok=True)
logger.add(str(log_dir / "hydra.log"), rotation="10 MB", retention="7 days", level=LOG_LEVEL)