from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"
    TESSERACT_CMD: str = "/usr/bin/tesseract" # Default path on linux
    BLUR_THRESHOLD: float = 100.0

    class Config:
        env_file = ".env"

settings = Settings()
