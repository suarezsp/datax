from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.alert import Alert as AlertModel
from app.schemas.alert import Alert
from app.services.alert_service import get_active_alerts

router = APIRouter(prefix="/alerts", tags=["alerts"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/active", response_model=list[Alert])
def get_alerts(db: Session = Depends(get_db)):
    alerts = get_active_alerts(db)
    if isinstance(alerts, tuple):
        alerts = alerts[0]
    if alerts is None:
        return []
    return alerts


@router.post("/", response_model=Alert)
def add_alert(alert: Alert, db: Session = Depends(get_db)):
    new_alert = AlertModel(**alert.model_dump())
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return new_alert