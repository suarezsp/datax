# hydra – API Reference (v0.1)

This document provides the technical reference for the main REST endpoints of the **FastAPI** backend.

---

##`/metrics/`

### `POST /metrics/`
**Description:** Inserts a new metric record into the database.

**Example JSON Body:**

```json
{
  "host": "server-01",
  "cpu_usage": 72.5,
  "memory_usage": 68.4,
  "latency": 10.2,
  "timestamp": "2025-10-25T14:30:00Z"
}

//-> Response:

{
  "status": "ok",
  "metric_id": 123
}
```