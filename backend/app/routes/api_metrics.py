from fastapi import APIRouter, Depends, Query
from typing import List
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.metric import Metric as MetricModel
from app.schemas.metric import MetricResponse

router = APIRouter(prefix="/api", tags=["api"])

@router.get("/metrics", response_model=List[MetricResponse])
def api_get_metrics(
    db: Session = Depends(get_db),
    host: str = Query("", description="Filter by host, empty = all"),
    limit: int = Query(200, ge=1, le=10000),
):
    q = db.query(MetricModel)
    if host:
        q = q.filter(MetricModel.host == host)
    metrics = q.order_by(MetricModel.timestamp.desc()).limit(limit).all()
    return metrics