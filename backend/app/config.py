import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "CyberGuard AI - Phishing & Vulnerability Intelligence Platform"
    PROJECT_CODENAME: str = "CYBERGUARD-CORE"
    VERSION: str = "2.0.0-PRO"
    API_PREFIX: str = "/api"
    
    # Gemini AI Integration (Configurable via environment variable GEMINI_API_KEY)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # Browser / Sandbox limits
    BROWSER_TIMEOUT_MS: int = 12000
    MAX_REDIRECTS: int = 10
    BLOCK_PRIVATE_IPS: bool = True
    SCREENSHOT_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "screenshots")
    DATABASE_PATH: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage", "phishing_intel.db")
    EXTENSION_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "extension")
    
    # Model Weights & Risk Thresholds
    RISK_THRESHOLD_CRITICAL: float = 85.0
    RISK_THRESHOLD_HIGH: float = 65.0
    RISK_THRESHOLD_MEDIUM: float = 40.0
    RISK_THRESHOLD_LOW: float = 15.0

settings = Settings()
os.makedirs(settings.SCREENSHOT_DIR, exist_ok=True)
os.makedirs(os.path.dirname(settings.DATABASE_PATH), exist_ok=True)
os.makedirs(settings.EXTENSION_DIR, exist_ok=True)
