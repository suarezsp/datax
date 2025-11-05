from datetime import datetime
from app.models.metric import Metric
from app.models.alert import Alert

def test_metric_persistence_basic(db_session):
    m = Metric(host="m-host", cpu_usage=12.5, memory_usage=33.3, latency=5.5, timestamp=datetime.utcnow())
    db_session.add(m)
    db_session.commit()
    assert m.id is not None

    fetched = db_session.query(Metric).filter_by(host="m-host").first()
    assert fetched is not None
    assert abs(fetched.cpu_usage - 12.5) < 1e-6

def test_alert_persistence_basic(db_session):
    a = Alert(host="a-host", type="cpu_high", value=95.0, timestamp=datetime.utcnow(), status=True)
    db_session.add(a)
    db_session.commit()
    assert a.id is not None

    fetched = db_session.query(Alert).filter_by(host="a-host").first()
    assert fetched.type == "cpu_high"