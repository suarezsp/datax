import pytest
from datetime import datetime
from app.schemas.metric import MetricCreate

def test_metric_schema_rejects_bad_types():
    # cpu_usage must be a float - sending string should raise validation error
    with pytest.raises(Exception):
        MetricCreate(host="h1", cpu_usage="bad", memory_usage=10.0, latency=5.0, timestamp=datetime.utcnow())

def test_metric_schema_accepts_iso_timestamp():
    iso = datetime.utcnow().isoformat()
    m = MetricCreate(host="cast-host", cpu_usage=1.0, memory_usage=2.0, latency=3.0, timestamp=iso)
    assert m.host == "cast-host"