# this is demo
from fastapi import APIRouter, Query

router = APIRouter(prefix="/predictions", tags=["predictions"])

@router.get("")
async def get_predictions(host: str = Query(...)):
    return {
        "host": host,
        "predicted_cpu": 45.8,
        "predicted_memory": 63.2,
        "predicted_latency": 105.0,
    }