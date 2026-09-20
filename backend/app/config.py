import os
from pydantic import BaseModel

# Automatically load .env file from project root or backend if present
for _env_path in [
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
    os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
]:
    if os.path.exists(_env_path):
        try:
            with open(_env_path, "r", encoding="utf-8") as _f:
                for _line in _f:
                    _line = _line.strip()
                    if _line and not _line.startswith("#") and "=" in _line:
                        _k, _v = _line.split("=", 1)
                        _k, _v = _k.strip(), _v.strip().strip("'\"")
                        if _k and _k not in os.environ:
                            os.environ[_k] = _v
        except Exception:
            pass

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

    # x402 & Algorand Testnet Settings
    FACILITATOR_URL: str = os.getenv("FACILITATOR_URL", "https://facilitator.goplausible.xyz")
    ALGOD_SERVER: str = os.getenv("ALGOD_SERVER", "https://testnet-api.4160.nodely.dev")
    ALGOD_INDEXER: str = os.getenv("ALGOD_INDEXER", "https://testnet-idx.4160.nodely.dev")
    NETWORK: str = os.getenv("NETWORK", "Algorand Testnet")
    AVM_ADDRESS: str = os.getenv("AVM_ADDRESS", "MZM62WIYCYOFBA76RGWOYLSIP54PNFVYEFMC3ZYFUJZBBUDLR7MAOX6YFY")
    CYBERGUARD_TESTNET_RECEIVER: str = os.getenv("CYBERGUARD_TESTNET_RECEIVER", "MZM62WIYCYOFBA76RGWOYLSIP54PNFVYEFMC3ZYFUJZBBUDLR7MAOX6YFY")
    PREMIUM_AUDIT_PRICE_ALGO: float = float(os.getenv("PREMIUM_AUDIT_PRICE_ALGO", "0.1"))
    PREMIUM_AUDIT_PRICE_MICROALGOS: int = int(os.getenv("PREMIUM_AUDIT_PRICE_MICROALGOS", "100000"))

settings = Settings()
os.makedirs(settings.SCREENSHOT_DIR, exist_ok=True)
os.makedirs(os.path.dirname(settings.DATABASE_PATH), exist_ok=True)
os.makedirs(settings.EXTENSION_DIR, exist_ok=True)
