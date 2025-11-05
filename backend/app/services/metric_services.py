from sqlalchemy.orm import Session
from app.models.metric import Metric
from app.schemas.metric import MetricCreate
from app.services.alert_service import check_for_alerts


# create a new metric and check for alerts
def create_metric(db: Session, metric_data: MetricCreate):
    # save metric 
    metric = Metric(**metric_data.model_dump())
    db.add(metric)
    db.commit()
    db.refresh(metric)
    # check for alerts
    check_for_alerts(db, metric)
    return metric

# retrieve recent metrics
def get_recent_metrics(db: Session, limit: int = 50):
    return db.query(Metric).order_by(Metric.timestamp.desc()).limit(limit).all()