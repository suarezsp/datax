from fastapi import FastAPI
from app.routes.metric_routes import router as metric_router
from app.routes.alert_routes import router as alert_router
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="hydra API", version="0.1")

app.include_router(metric_router)
app.include_router(alert_router)

@app.get("/")
def root():
    return {"message": "Welcome to Hydra API"}
