import os, sys
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
    csv_metrics = get_sample_path("hydra_metrics_sample.csv")
    csv_alerts = get_sample_path("hydra_alerts_sample.csv")
    reset = "--reset" in sys.argv

    db = SessionLocal()
    try:
        if reset:
            print("Resetting tables: truncating alerts and metrics")
            db.execute("TRUNCATE TABLE alerts RESTART IDENTITY CASCADE;")
            db.execute("TRUNCATE TABLE metrics RESTART IDENTITY CASCADE;")
            db.commit()

        load_metrics(csv_metrics, db)
        load_alerts(csv_alerts, db)
    finally:
        db.close()

if __name__ == "__main__":
    main()