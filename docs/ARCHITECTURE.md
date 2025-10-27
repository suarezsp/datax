# hydra – Technical Architecture

**hydra** is designed with a modular and scalable architecture, where each component plays a clear role within the data flow and analysis process.

---

## General Diagram
        ┌────────────────────────────────────────────┐
        │                 FRONTEND                   │
        │           React + Vite + Recharts          │
        │────────────────────────────────────────────│
        │ Dashboards, visualizations, alert UI       │
        └──────────────────────┬─────────────────────┘
                               │ REST API / JSON
                               ▼
        ┌────────────────────────────────────────────┐
        │                 BACKEND                    │
        │              FastAPI + SQLAlchemy           │
        │────────────────────────────────────────────│
        │ REST endpoints, authentication, business    │
        │ logic, and database connections             │
        └──────────────────────┬─────────────────────┘
                               │ PostgreSQL Driver
                               ▼
        ┌────────────────────────────────────────────┐
        │                 DATABASE                   │
        │         PostgreSQL / TimescaleDB            │
        │────────────────────────────────────────────│
        │ Metric and alert tables with time series    │
        │ and aggregation support.                    │
        └──────────────────────┬─────────────────────┘
                               │ CSV / Query / API
                               ▼
        ┌────────────────────────────────────────────┐
        │                 ANALYTICS                  │
        │       Python (Pandas, Scikit-Learn)        │
        │────────────────────────────────────────────│
        │ ETL, anomaly detection, forecasting         │
        └────────────────────────────────────────────┘

---

## Main Components

### **1. Backend (FastAPI)**
- Modern and high-performance framework.
- Exposes REST endpoints:
  - `/metrics/` → metrics CRUD.
  - `/alerts/` → active alerts.
  - `/analytics/trends` → aggregated statistics.
  - `/predictions/` → forecasting.
- ORM integration via SQLAlchemy.
- Migrations handled with Alembic.
- Configuration in `app/core/config.py`.

---

### **2. Database (TimescaleDB)**
- PostgreSQL extension optimized for time series data.
- Main tables:
  - `metrics`: performance records by timestamp.
  - `alerts`: detected anomalies.
- Supports time-range queries, downsampling, and aggregations.

---

### **3. Analytics**
- ETL scripts (`extract_data`, `transform_data`, `load_data`).
- ML models for anomaly detection and forecasting.
- Exploratory notebooks in `/analytics/notebooks/`.

---

### **4. Frontend (React)**
- Modular SPA built with Vite.
- Real-time metric visualization with `Recharts`.
- API integration using `axios` or `React Query`.
- Components include:
  - `MetricChart`, `AlertTable`, `Sidebar`, `Navbar`, `TrendGraph`.

---

### **5. Infrastructure (Docker / Compose / K8s)**
- Separate containers for DB, backend, and frontend.
- Simple orchestration via Docker Compose.
- Scalable to Kubernetes (`infra/k8s/`).

---

## Data Flow

1. **Input:** Systems or simulators send metrics to `/metrics/`.
2. **Processing:** The backend validates, stores, and analyzes the data.
3. **Detection:** Analytics scripts detect anomalies and generate alerts.
4. **Prediction:** The ML model estimates trends.
5. **Visualization:** The frontend displays metrics, alerts, and forecasts in real time.

---

## Security and Authentication

- Basic JWT authentication (future phase).
- Environment configuration via `.env`.
- Configurable CORS and rate limiting.

---

## Future Technical Improvements

- Microservices with API Gateway.
- Metric streaming with Kafka or RabbitMQ.
- NoSQL persistence for logs (MongoDB).
- Grafana as an alternative visualization source.

---