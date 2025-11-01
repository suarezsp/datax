from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from app.core.database import Base
from datetime import datetime

class Alert(Base):
    __tablename__ = "alerts"  # specify the table name

    id = Column(Integer, primary_key=True, index=True)  # primary key column
    host = Column(String, index=True)  # host column
    type = Column(String)  # alert type column
    value = Column(Float)  # alert value column
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(Boolean, default="active")  # status column to indicate if alert is active or resolved