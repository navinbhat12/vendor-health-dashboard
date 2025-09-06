from sqlalchemy.orm import Session
from app.database import get_db
from app.services.alphavantage import alpha_vantage_service

# Database dependency
def get_database() -> Session:
    """Get database session dependency"""
    return next(get_db())

# Alpha Vantage service dependency
def get_alphavantage_service():
    """Get Alpha Vantage service dependency"""
    return alpha_vantage_service
