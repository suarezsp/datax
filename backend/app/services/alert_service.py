from sqlalchemy.orm import Session
from app.models.alert import Alert
from app.models.metric import Metric
from datetime import datetime

# check for alerts based on metric thresholds
def check_for_alerts(db: Session, metric: Metric):
    alerts_triggered = []

    # define thresholds
    if metric.cpu_usage > 90.0:
        alerts_triggered.append(("CPU Usage High", metric.cpu_usage))
    if metric.memory_usage > 85.0:
        alerts_triggered.append(("Memory Usage High", metric.memory_usage))
    if metric.latency > 250.0:
        alerts_triggered.append(("Latency High", metric.latency))

    # create alert records
    for alert_type, value in alerts_triggered:
        alert = Alert(
            host=metric.host,
            type=alert_type,
            value=value,
            timestamp=datetime.utcnow(),
            status="active"
        )
        db.add(alert)
    if alerts_triggered:
        db.commit()

def get_active_alerts(db: Session):
    return db.query(Alert).filter(Alert.status == "active").order_by(Alert.timestamp.desc()).all()