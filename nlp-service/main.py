"""
SkillLens NLP Service
FastAPI microservice for resume parsing and skill extraction
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import analysis, skills, health
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="SkillLens NLP Service",
    description="AI-powered resume parsing and skill extraction microservice",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(analysis.router, prefix="/api", tags=["Analysis"])
app.include_router(skills.router, prefix="/api", tags=["Skills"])


@app.on_event("startup")
async def startup_event():
    """Initialize models and resources on startup"""
    logger.info("Starting SkillLens NLP Service...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    # Load NLP models here if needed
    logger.info("NLP Service started successfully!")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down NLP Service...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
