import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.routes.metric_routes import router as metric_router
from app.routes.alert_routes import router as alert_router
from app.routes.analytics_routes import router as analytics_router
from app.routes.prediction_routes import router as prediction_router
from app.core.database import Base, engine

from app.routes.api_metrics import router as api_metrics_router

from app.services.metric_generator import start_metric_generator

# basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Hydra API",
    version="0.1.0",
    description="Backend service for the Hydra monitoring system"
)

# CORS for frontend
origins = [
    "http://localhost:5173",   # React dev server
    "http://127.0.0.1:5173",
    # add production origins when ready
    # "https://hydra.example.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# init of db (dev only)
if os.getenv("HYDRA_DEV_MODE", "false").lower() in ("1", "true", "yes"):
    logger.info("Development mode enabled: creating tables...")
    Base.metadata.create_all(bind=engine)

# include app routers
app.include_router(metric_router)
app.include_router(alert_router)
app.include_router(analytics_router)
app.include_router(prediction_router)

# include API endpoints (frontend JSON)
app.include_router(api_metrics_router)


# endpoints
@app.get("/")
def root():
    return {"message": "Welcome to Hydra API"}


@app.get("/health")
def health():
    """Simple DB health check."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception as e:
        logger.exception("Database health check failed.")
        return {"status": "error", "detail": str(e)}


# Start metric generator on startup if requested via env
@app.on_event("startup")
def _maybe_start_metric_generator():
    should_start = (
        os.getenv("HYDRA_GENERATE_METRICS", "false").lower() in ("1", "true", "yes")
        or os.getenv("HYDRA_DEV_MODE", "false").lower() in ("1", "true", "yes")
    )
    if not should_start:
        logger.debug("Metric generator not enabled (set HYDRA_GENERATE_METRICS or HYDRA_DEV_MODE to start).")
        return

    # parse optional hosts and interval
    gen_hosts_env = os.getenv("HYDRA_GEN_HOSTS")
    hosts = [h.strip() for h in gen_hosts_env.split(",") if h.strip()] if gen_hosts_env else None
    try:
        interval = float(os.getenv("HYDRA_GEN_INTERVAL", "5"))
    except Exception:
        interval = 5.0

    start_metric_generator(hosts=hosts, interval_seconds=interval)
    logger.info(f"Metric generator started (hosts={hosts or 'default'}, interval={interval}s)")


# prometheus metrics
# prometheus metrics (robusta: instrumenta y monta ASGI app de prometheus en /prometheus)
try:
    from prometheus_fastapi_instrumentator import Instrumentator
    from prometheus_client import make_asgi_app

    # instrument the FastAPI app (collectors, middleware, etc.)
    Instrumentator().instrument(app)

    # mount Prometheus exposition at /prometheus (texto que viste)
    app.mount("/prometheus", make_asgi_app())

    logger.info("Prometheus instrumentation enabled and mounted at /prometheus")
except ImportError:
    logger.warning("Prometheus instrumentation not installed.")
except Exception as e:
    logger.error(f"Prometheus setup failed: {e}")