import csv, random
from datetime import datetime, timedelta

hosts = [f"hydra-node-{i:02d}" for i in range(1, 21)]
start_time = datetime(2025, 10, 31)
rows_metrics, rows_alerts = [], []

for host in hosts:
    t = start_time
    for _ in range(288):  # 24h / 5min
        cpu = max(0, min(100, 40 + 25 * random.random() + 20 * random.random()))
        mem = max(0, min(100, 35 + 30 * random.random()))
        lat = 30 + cpu * 2 + random.random() * 20
        ts = t.isoformat() + "Z"
        rows_metrics.append([host, round(cpu,1), round(mem,1), round(lat,1), ts])
        t += timedelta(minutes=5)
        if cpu > 90:
            rows_alerts.append([len(rows_alerts)+1, host, "cpu_high", cpu, ts, random.choice(["active","resolved"])])
        if mem > 85:
            rows_alerts.append([len(rows_alerts)+1, host, "memory_high", mem, ts, random.choice(["active","resolved"])])
        if lat > 250:
            rows_alerts.append([len(rows_alerts)+1, host, "latency_high", lat, ts, random.choice(["active","resolved"])])

# save cvs
with open("hydra_metrics_sample.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["host","cpu_usage","memory_usage","latency","timestamp"])
    writer.writerows(rows_metrics)

with open("hydra_alerts_sample.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["id","host","type","value","timestamp","status"])
    writer.writerows(rows_alerts)

print("Files generated: hydra_metrics_sample.csv y hydra_alerts_sample.csv")