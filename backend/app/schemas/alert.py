from pydantic import BaseModel, ConfigDict
from datetime import datetime

class Alert(BaseModel):  # Define the base schema for alerts
    id : int
    host: str
    type : str 
    value: float 
    timestamp : datetime
    status: str

    model_config = ConfigDict(from_attributes=True)
    