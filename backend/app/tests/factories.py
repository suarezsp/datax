from datetime import datetime, timedelta
import random
from app.schemas.metric import MetricCreate

# creates random metrics for testing

def metric_payload(host="test-host", cpu=10.0, mem=20.0, lat=5.0, ts=None):
    if ts is None:
        ts = datetime.utcnow()
    return MetricCreate(
        host=host,
        cpu_usage=cpu,
        memory_usage=mem,
        latency=lat,
        timestamp=ts
    )

def random_metrics(n=10, host_prefix="node"):
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    out = []
    for i in range(n):
        out.append(metric_payload(
            host=f"{host_prefix}-{i%5}",
            cpu=random.uniform(0, 100),
            mem=random.uniform(0, 100),
            lat=random.uniform(0, 400),
            ts=now - timedelta(minutes=5 * i)
        ))
    return out