from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Application configuration settings pulled securely from the environment."""
    
    APP_NAME: str = "Analytics Dashboard API"
    DEBUG: bool = True
    
    # Mandatory MongoDB Atlas settings
    MONGO_URI: str
    MONGO_DB_NAME: str
    
    CORS_ORIGINS: List[str] = ["*"]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
