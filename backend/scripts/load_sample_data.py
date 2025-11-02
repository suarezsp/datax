import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))   # .../backend/scripts
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)                 # .../backend
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)


import pandas as pd
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.metric import Metric
from app.models.alert import Alert

def get_sample_path(filename: str) -> str:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_dir, "samples", filename)

def load_metrics(csv_path: str, db: Session):
    df = pd.read_csv(csv_path, parse_dates=['timestamp'])
    metrics = [
        Metric(
            host=row['host'],
            cpu_usage=float(row['cpu_usage']),
            memory_usage=float(row['memory_usage']),
            latency=float(row['latency']),
            timestamp=row['timestamp'].to_pydatetime()
        )
        for _, row in df.iterrows()
    ]
    db.bulk_save_objects(metrics)
    db.commit()
    print(f"Loaded {len(metrics)} metrics")

def load_alerts(csv_path: str, db: Session):
    df = pd.read_csv(csv_path, parse_dates=['timestamp'])
    alerts = [
        Alert(
            host=row['host'],
            type=row['type'],
            value=float(row['value']),
            timestamp=row['timestamp'].to_pydatetime(),
            status=row['status']
        )
        for _, row in df.iterrows()
    ]
    db.bulk_save_objects(alerts)
    db.commit()
    print(f"Loaded {len(alerts)} alerts")

def main():
    if len(sys.argv) >= 3:
        metrics_csv, alerts_csv = sys.argv[1], sys.argv[2]
    else:
        metrics_csv = get_sample_path("hydra_metrics_sample.csv")
        alerts_csv = get_sample_path("hydra_alerts_sample.csv")

    print(f"Using sample data:\n  - Metrics: {metrics_csv}\n  - Alerts: {alerts_csv}")

    db = SessionLocal()
    try:
        load_metrics(metrics_csv, db)
        load_alerts(alerts_csv, db)
    finally:
        db.close()

if __name__ == "__main__":
    main()