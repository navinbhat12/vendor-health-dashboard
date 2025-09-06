from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # Alpha Vantage API Configuration
    alpha_vantage_api_key: str = Field(..., env="ALPHA_VANTAGE_API_KEY")
    alpha_vantage_base_url: str = Field(
        default="https://www.alphavantage.co/query",
        env="ALPHA_VANTAGE_BASE_URL"
    )
    
    # Database Configuration
    database_url: str = Field(
        default="sqlite:///./vendor_data.db",
        env="DATABASE_URL"
    )
    
    # Application Configuration
    debug: bool = Field(default=False, env="DEBUG")
    api_version: str = Field(default="v1", env="API_VERSION")
    frontend_url: str = Field(
        default="http://localhost:5174",
        env="FRONTEND_URL"
    )
    
    # Rate Limiting Configuration
    requests_per_minute: int = Field(default=5, env="REQUESTS_PER_MINUTE")
    cache_expiry_hours: int = Field(default=24, env="CACHE_EXPIRY_HOURS")
    
    # CORS Configuration
    allowed_origins: List[str] = Field(
        default=[
            "http://localhost:5175", 
            "http://localhost:5174", 
            "http://localhost:5173", 
            "http://localhost:3000",
            "https://windborne-swe.vercel.app",
            "https://*.vercel.app"
        ],
        env="ALLOWED_ORIGINS"
    )
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Allow extra environment variables


# Global settings instance
settings = Settings()
