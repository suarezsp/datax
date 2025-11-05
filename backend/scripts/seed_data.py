#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import SessionLocal
from app.models.metric import Metric
from app.models.alert import Alert
from datetime import datetime, timedelta
import random

def main():
    db = SessionLocal()

    hosts = ["hydra-app-1", "hydra-db-1", "hydra-proxy"]

    for host in hosts:
        for i in range(24):
            m = Metric(
                host=host,
                cpu_usage=random.uniform(10, 90),
                memory_usage=random.uniform(20, 80),
                latency=random.uniform(1, 100),
                timestamp=datetime.utcnow() - timedelta(hours=i),
            )
            db.add(m)

        a = Alert(
            host=host,
            type="CPU_HIGH",
            value=random.uniform(85, 95),
            timestamp=datetime.utcnow(),
            status="active",
        )
        db.add(a)

    db.commit()
    db.close()
    print("Seed data inserted successfully.")

if __name__ == "__main__":
    main()