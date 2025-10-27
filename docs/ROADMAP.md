# hydra Roadmap

---

## Phase 0 – Environment Preparation (Week 0)

**Objective:** Set up environment, dependencies, and base structure.

**Tasks:**
- Install global dependencies (Python, Node, Docker, Git).
- Create project structure (`backend`, `dashboard`, `analytics`, `infra`).
- Configure virtual environment and base packages.
- Create `README.md`, `.env.example`, and `.gitignore` files.

**Deliverable:** Base project with FastAPI and React running locally.

---

## Phase 1 – Backend Core and Database (Weeks 1–2)

**Objective:** Build the backend foundation and integrate the database.

**Tasks:**
- Configure SQLAlchemy + Alembic.
- Create `Metric` and `Alert` models.
- Implement endpoints:
  - `POST /metrics/` → receive metrics.
  - `GET /metrics/` → retrieve filtered metrics.
  - `GET /alerts/` → retrieve active alerts.
- Add unit tests and data seeding.
- Create Dockerfile for backend.

**Deliverable:** Functional API with persistent Timescale/PostgreSQL DB.

---

## Phase 2 – Analytics Module and Anomaly Detection (Weeks 3–4)

**Objective:** Process and analyze metrics to detect anomalies.

**Tasks:**
- Create ETL scripts in `/analytics/etl/`.
- Implement anomaly detection (`z-score` or `IsolationForest`).
- Generate reports and aggregated statistics (`/analytics/trends`).
- Integrate automatic alerts in backend (`AlertService`).

**Deliverable:** Automatically generated alerts with simulated data.

---

## Phase 3 – React Dashboard (Weeks 5–6)

**Objective:** Visualize metrics and alerts in real time.

**Tasks:**
- Create modular React app structure.
- Implement views:
  - Main dashboard (`/dashboard`).
  - Server details (`/details/:host`).
  - Alerts list (`/alerts`).
- Integrate backend API via `axios` or `React Query`.
- Use libraries: `Recharts`, `Shadcn/UI`, `Framer Motion`.

**Deliverable:** Functional dashboard displaying live data from FastAPI.

---

## Phase 4 – Integration and Docker Compose (Week 7)

**Objective:** Integrate all services and enable one-command deployment.

**Tasks:**
- Create `Dockerfile` for both frontend and backend.
- Configure `docker-compose.yml`.
- Validate internal network (backend ↔ DB ↔ frontend).
- Add `run_demo.sh` script.

**Deliverable:** Full project running with `docker compose up`.

---

## Phase 5 – Prediction and Forecasting (Weeks 8–9)

**Objective:** Incorporate predictive load modeling.

**Tasks:**
- Implement simple forecasting model (ARIMA / Prophet).
- Endpoint `/predictions/` → returns expected trend.
- Visualize forecasts in frontend.
- Create `Forecasting_demo.ipynb` notebook.

**Deliverable:** Dashboard with predictive trend charts.

---

## Phase 6 – Testing, Documentation, and Final Demo (Weeks 10–11)

**Objective:** Prepare the project for professional presentation.

**Tasks:**
- Full tests (backend + frontend).
- Optimize queries and performance.
- Write technical and API documentation.
- Create `PRESENTATION_DECK.pptx` + demo video (2–3 min).

**Deliverable:** Final, stable, and well-documented project.

---

## Phase 7 – Scalability and Enterprise Deployment (Optional)

**Possible Extras:**
- Kubernetes (`infra/k8s/`).
- OAuth2/JWT authentication.
- Centralized logging (ELK stack).
- Monitoring with Prometheus / Grafana.
- CI/CD using GitHub Actions.

---

## Current Status

| Phase | Description | Status |
|-------|--------------|--------|
| 0 | Environment and base structure | X |
| 1 | Backend and DB |  |
| 2 | Analytics and alerts |  |
| 3 | Frontend dashboard |  |
| 4 | Integration and Docker |  |
| 5 | Forecasting and ML |  |
| 6 | Documentation and demo |  |
| 7 | Scalability (extra) |   |

---