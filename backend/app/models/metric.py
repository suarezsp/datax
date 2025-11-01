from sqlalchemy import Column, Integer, String, Float, DateTime # import necessary SQLAlchemy components
from app.core.database import Base # import Base from database module
from datetime import datetime # import datetime for timestamp


class Metric(Base):
    __tablename__ = "metrics"  # specify the table name

    id = Column(Integer, primary_key=True, index=True)  # primary key column
    host = Column(String, index=True)  # host column
    cpu_usage = Column(Float)  # CPU usage column
    memory_usage = Column(Float)  # Memory usage column
    latency = Column(Float)  # Latency column
    timestamp = Column(DateTime, default=datetime.utcnow)  # timestamp column with default value