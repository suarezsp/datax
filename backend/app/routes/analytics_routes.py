# this is demo
from fastapi import APIRouter

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/trends")
async def get_trends():
    return {
        "cpu_avg": 37.2,
        "memory_avg": 61.5,
        "latency_avg": 120.0,
        "trend": "stable",
    }