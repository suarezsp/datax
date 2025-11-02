import os
from fastapi import FastAPI
from app.routes.metric_routes import router as metric_router
from app.routes.alert_routes import router as alert_router
from app.core.database import Base, engine

app = FastAPI(title="hydra API", version="0.1")

if os.getenv("HYDRA_DEV_MODE", "false").lower() in ("1", "true", "yes"):
    Base.metadata.create_all(bind=engine)

app.include_router(metric_router)
app.include_router(alert_router)

@app.get("/")
def root():
    return {"message": "Welcome to Hydra API"}

@app.get("/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}