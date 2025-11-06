# backend/app/services/metric_generator.py
import time
import threading
import random
from datetime import datetime
from typing import List

from app.core.database import SessionLocal
from app.models.metric import Metric as MetricModel

DEFAULT_HOSTS = ["dev-host-1", "dev-host-2", "dev-host-3"]

def _insert_metrics_loop(hosts: List[str], interval_seconds: float = 5.0):

    while True:
        try:
            db = SessionLocal()
            now = datetime.utcnow()
            for host in hosts:
                # Create synthetic but plausible values
                cpu = round(random.uniform(5, 95), 2)
                mem = round(random.uniform(10, 95), 2)
                # small random latency
                latency = round(random.uniform(10, 300), 1)

                m = MetricModel(
                    host=host,
                    cpu_usage=cpu,
                    memory_usage=mem,
                    latency=latency,
                    timestamp=now,
                )
                db.add(m)
            db.commit()
            db.close()
        except Exception as exc:
            try:
                db.rollback()
                db.close()
            except Exception:
                pass
            # don't crash thread; print to stdout/stderr to help debug
            print("Metric generator error:", exc)
        time.sleep(interval_seconds)

def start_metric_generator(hosts: List[str] = None, interval_seconds: float = 5.0, daemon: bool = True):
    if hosts is None:
        hosts = DEFAULT_HOSTS
    t = threading.Thread(target=_insert_metrics_loop, args=(hosts, interval_seconds), daemon=daemon)
    t.start()
    return t