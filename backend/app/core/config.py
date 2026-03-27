from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration settings."""
    
    APP_NAME: str = "Analytics Dashboard API"
    DEBUG: bool = True
    
    # MongoDB Atlas settings
    MONGO_URI: str = "mongodb+srv://princeraj3835_db_user:xirMawc9OQiySITM@cluster0.9xltfhr.mongodb.net/analytics_db?retryWrites=true&w=majority"
    MONGO_DB_NAME: str = "analytics_db"
    
    # CORS settings
    CORS_ORIGINS: list[str] = ["*"]
    
    class Config:
        env_file = ".env"


settings = Settings()
