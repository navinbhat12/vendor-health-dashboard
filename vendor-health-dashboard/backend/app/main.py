from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.database import create_tables
from app.api.endpoints import balance_sheet, health

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="WindBorne Systems Vendor Health Dashboard",
    description="Financial health analysis dashboard for potential WindBorne Systems vendors",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(balance_sheet.router, prefix="/api/v1", tags=["balance-sheet"])


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    logger.info("Starting WindBorne Vendor Dashboard API")
    create_tables()
    logger.info("Database tables created/verified")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    from app.services.alphavantage import alpha_vantage_service
    await alpha_vantage_service.close()
    logger.info("Application shutdown complete")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
