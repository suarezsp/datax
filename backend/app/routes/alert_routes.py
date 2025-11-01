from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.alert import Alert
from app.services.alert_service import get_active_alerts


router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/active", response_model=list[Alert])
def get_alerts(db: Session = Depends(get_db)):
    return get_active_alerts(db)