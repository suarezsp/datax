from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.metric import Metric
from app.schemas.metric import MetricCreate, MetricResponse
from app.core.database import get_db

router = APIRouter(prefix="/metrics", tags=["metrics"])

@router.post("/", response_model=MetricResponse)
def create_metric(metric: MetricCreate, db: Session = Depends(get_db)):
    db_metric = Metric(**metric.dict())
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric

@router.get("/{metric_id}", response_model=MetricResponse)
def get_metrics(db: Session = Depends(get_db)):
    return db.query(Metric).order_by(Metric.timestamp.desc()).limit(50).all()