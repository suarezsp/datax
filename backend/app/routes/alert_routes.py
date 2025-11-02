from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.alert import Alert as AlertModel
from app.schemas.alert import Alert

router = APIRouter(prefix="/alerts", tags=["alerts"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[Alert])
def get_alerts(limit: int = 100, db: Session = Depends(get_db)):
    alerts = db.query(AlertModel).order_by(AlertModel.timestamp.desc()).limit(limit).all()
    return alerts


@router.post("/", response_model=Alert)
def add_alert(alert: Alert, db: Session = Depends(get_db)):
    new_alert = AlertModel(**alert.dict())
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return new_alert