"""
Health Check Routes
"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "nlp-service",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "SkillLens NLP Service",
        "version": "1.0.0",
        "docs": "/docs",
    }
