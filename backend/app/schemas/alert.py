from pydantic import BaseModel
from datetime import datetime

class Alert(BaseModel):  # Define the base schema for alerts
    id : int
    host: str
    type : str 
    value: float 
    timestamp : datetime
    status: str

    class Config: 
        orm_mode = True
    