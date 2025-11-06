# hydra
Full-stack platform for monitoring the performance of systems and services in real time, automatically detecting anomalies, and predicting failures through time series analytics and machine learning.

## Main resources

- **FastAPI backend**, with optimized databases for temporal series.
- **Anomalies detection** based in statistics analysis and ML.
- **Tendency prediction** based in forecasting models.
- **Interactive dashboard** with React + Tailwindcss
- **Scalable and modular architecture** ready for Docker/Kubernetes
- **ETL scripts and notebooks** for advanced analisis
- **Demo** ready to be used.


## Instalation

1. Repo

```bash
git clone https://github.com/suarezsp/hydra.git
cd hydra
```

2. Backend (localhost:8000)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # (Windows: venv\Scripts\activate)
pip install -r requirements.txt
uvicorn app.main:app --reload
# or with generator
HYDRA_GENERATE_METRICS=true HYDRA_GEN_HOSTS="dev1,dev2" HYDRA_GEN_INTERVAL=3 uvicorn app.main:app --reload --port 8000
```

3. Frontend (localhost:5173)

```bash
cd dashboard
npm install
npm run dev
```

4. Docker

```bash
cd infra
docker compose up --build
```

5. Generate sample data

```bash
cd hydra
python backend/scripts/generate_sample_data.py
mv hydra_metrics_sample.csv /backend/samples/
mv hydra_alerts_sample.csv /backend/samples/
```
