from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.metric import Metric
from app.schemas.metric import MetricCreate, MetricResponse

router = APIRouter(prefix="/metrics", tags=["metrics"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[MetricResponse])
def get_metrics(limit: int = 100, db: Session = Depends(get_db)):
    metrics = db.query(Metric).order_by(Metric.timestamp.desc()).limit(limit).all()
    return metrics

@router.post("/", response_model=MetricResponse)
def add_metric(metric: MetricCreate, db: Session = Depends(get_db)):
    new_metric = Metric(**metric.model_dump())
    db.add(new_metric)
    db.commit()
    db.refresh(new_metric)
    return new_metric