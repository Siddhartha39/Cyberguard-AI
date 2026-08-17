import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.api.endpoints import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CyberGuard AI - Enterprise Phishing Domain Intelligence & Website Security Posture Auditor"
)

# CORS middleware for frontend and extension communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for screenshots
screenshots_dir = settings.SCREENSHOT_DIR
os.makedirs(screenshots_dir, exist_ok=True)
app.mount("/api/screenshots", StaticFiles(directory=screenshots_dir), name="screenshots")

# Include API endpoints
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/")
def health_check():
    return {
        "status": "operational",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
