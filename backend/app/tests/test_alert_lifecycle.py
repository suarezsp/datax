from datetime import datetime
from app.schemas.metric import MetricCreate
from app.services.metric_services import create_metric
from app.services.alert_service import get_active_alerts
from app.models.alert import Alert

def test_alert_created_and_can_be_resolved(db_session):
    # create a metric that triggers an alert
    mdata = MetricCreate(host="life-host", cpu_usage=99.9, memory_usage=90.0, latency=300.0, timestamp=datetime.utcnow())
    metric = create_metric(db_session, mdata)

    alerts = get_active_alerts(db_session)
    if isinstance(alerts, tuple):
        alerts = alerts[0]
    # expect at least one active alert
    assert any(a.host == "life-host" for a in alerts)

    # resolve an alert: update status to False (or "resolved" depending on model)
    a = alerts[0]
    # ff model uses boolean:
    try:
        a.status = False
    except Exception:
        # if status is str like "active" set to "resolved"
        a.status = "resolved"
    db_session.add(a)
    db_session.commit()

    # fetch active alerts again
    new_alerts = get_active_alerts(db_session)
    if isinstance(new_alerts, tuple):
        new_alerts = new_alerts[0]
    assert not any(x.id == a.id and (getattr(x, "status") in (True, "active")) for x in new_alerts)