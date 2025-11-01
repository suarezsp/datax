from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.metric import MetricCreate, MetricResponse
from app.services.metric_services import create_metric, get_recent_metrics

router = APIRouter(prefix="/metrics", tags=["metrics"])

@router.post("/", response_model=MetricResponse)
def add_metric(metric: MetricCreate, db: Session = Depends(get_db)):
    return create_metric(db, metric)

def list_metrics(db: Session = Depends(get_db)):
    return get_recent_metrics(db)