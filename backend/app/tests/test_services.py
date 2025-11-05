from datetime import datetime
from app.schemas.metric import MetricCreate
from app.services.metric_services import create_metric, get_recent_metrics
from app.services.alert_service import check_for_alerts, get_active_alerts

def normalize_alerts_result(res):
    if isinstance(res, tuple):
        return res[0]
    return res

def test_create_metric_creates_record_and_triggers_alert(db_session):
    mdata = MetricCreate(host="svc-host", cpu_usage=95.0, memory_usage=10.0, latency=5.0, timestamp=datetime.utcnow())
    metric = create_metric(db_session, mdata)
    assert metric.id is not None

    alerts = normalize_alerts_result(get_active_alerts(db_session))
    assert any(a.host == "svc-host" for a in alerts)

def test_get_recent_metrics_respects_limit(db_session):
    # insert 60 metrics
    for i in range(60):
        m = MetricCreate(host=f"h-{i}", cpu_usage=10, memory_usage=10, latency=10, timestamp=datetime.utcnow())
        create_metric(db_session, m)
    recent = get_recent_metrics(db_session, limit=50)
    assert len(recent) == 50

def test_check_for_alert_thresholds(db_session):
    # use check_for_alerts directly for specific thresholds
    mdata = MetricCreate(host="thr-host", cpu_usage=99.0, memory_usage=90.0, latency=300.0, timestamp=datetime.utcnow())
    # create a metric row as object to pass to check_for_alerts (simulate)
    from app.models.metric import Metric
    metric = Metric(**mdata.model_dump())
    db_session.add(metric)
    db_session.commit()

    # call check for alerts
    check_for_alerts(db_session, metric)
    alerts = normalize_alerts_result(get_active_alerts(db_session))
    types = [a.type.lower() for a in alerts]
    assert any("cpu" in t for t in types)
    assert any("memory" in t for t in types)
    assert any("latency" in t for t in types)