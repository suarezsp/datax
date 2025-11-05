import time
from app.models.metric import Metric

def test_bulk_insert_speed(db_session):
    # bulk insert 1000 metrics and assert it's reasonably fast (< 3s in local dev)
    bulk = []
    from datetime import datetime
    for i in range(1000):
        bulk.append(Metric(host=f"h-{i%50}", cpu_usage=10+i%50, memory_usage=30, latency=5, timestamp=datetime.utcnow()))
    start = time.time()
    db_session.bulk_save_objects(bulk)
    db_session.commit()
    took = time.time() - start
    assert db_session.query(Metric).count() == 1000
    # soft performance assertion; adjust threshold if your machine is slow
    assert took < 5.0