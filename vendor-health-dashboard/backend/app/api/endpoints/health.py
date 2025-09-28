from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "windborne-vendor-dashboard"
    }


@router.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "WindBorne Systems Vendor Health Dashboard API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }
