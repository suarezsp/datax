from pydantic import BaseModel, ConfigDict
from datetime import datetime

class MetricCreate(BaseModel): # Define the base schema for metrics
    host: str
    cpu_usage: float
    memory_usage: float
    latency: float
    timestamp: datetime
 
class MetricResponse(MetricCreate): # Schema for creating a new metric
    id: int

    model_config = ConfigDict(from_attributes=True)