from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.database import engine, Base
import app.models.models  # Ensure all models are registered with Base

# Import API routers
from app.api.auth import router as auth_router
from app.api.zones import router as zones_router
from app.api.map import router as map_router
from app.api.events import router as events_router
from app.api.crowd import router as crowd_router
from app.api.evacuation import router as evacuation_router
from app.api.alerts import router as alerts_router
from app.api.hazards import router as hazards_router
from app.api.analytics import router as analytics_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent campus event safety, crowd density monitoring, and dynamic evacuation guidance API.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(zones_router, prefix=settings.API_V1_STR)
app.include_router(map_router, prefix=settings.API_V1_STR)
app.include_router(events_router, prefix=settings.API_V1_STR)
app.include_router(crowd_router, prefix=settings.API_V1_STR)
app.include_router(evacuation_router, prefix=settings.API_V1_STR)
app.include_router(alerts_router, prefix=settings.API_V1_STR)
app.include_router(hazards_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred while processing the emergency routing request.",
            "error_type": exc.__class__.__name__
        }
    )

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "Operational",
        "prototype_notice": "ACADEMIC PROTOTYPE: Simulated data only. In real emergencies, follow official campus emergency instructions.",
        "docs_url": "/docs",
        "api_prefix": settings.API_V1_STR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
