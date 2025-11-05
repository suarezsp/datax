from datetime import datetime
from app.schemas.metric import MetricCreate

def test_post_metric_and_get_metrics(client):
    payload = {
        "host": "route-host",
        "cpu_usage": 12.3,
        "memory_usage": 34.5,
        "latency": 56.7,
        "timestamp": datetime.utcnow().isoformat()
    }
    resp = client.post("/metrics/", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert "id" in body and body["host"] == "route-host"

    # If GET /metrics/ exists return list and contains our host
    resp2 = client.get("/metrics/")
    assert resp2.status_code == 200
    data = resp2.json()
    assert isinstance(data, list)
    assert any(item.get("host") == "route-host" for item in data)

def test_alerts_endpoint_returns_list(client):
    resp = client.get("/alerts/active")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)