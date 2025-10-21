import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel

# Ladda .env från projektrot
env_path = Path(__file__).parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings(BaseModel):
    deepseek_api_key: str | None = os.getenv("DEEPSEEK_API_KEY")
    backend_port: int = int(os.getenv("BACKEND_PORT", "8000"))
    debug: bool = os.getenv("DEBUG", "true").lower() in {"1", "true", "yes"}
    cors_origins: list[str] = (
        os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    )


settings = Settings()
