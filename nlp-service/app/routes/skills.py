"""
Skills Routes
Job role skills endpoints
"""

from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel

from app.utils.job_roles import get_required_skills, get_all_roles

router = APIRouter()


class SkillItem(BaseModel):
    name: str
    level: str = "intermediate"
    category: str = None


class RoleSkillsResponse(BaseModel):
    role: str
    skills: List[SkillItem]


class RoleItem(BaseModel):
    id: str
    label: str


@router.get("/skills/{role_id}", response_model=RoleSkillsResponse)
async def get_role_skills(role_id: str):
    """Get required skills for a specific job role"""
    skills = get_required_skills(role_id)
    
    if not skills:
        raise HTTPException(status_code=404, detail="Role not found")
    
    return RoleSkillsResponse(
        role=role_id,
        skills=[SkillItem(**s) for s in skills]
    )


@router.get("/roles", response_model=List[RoleItem])
async def list_roles():
    """Get all available job roles"""
    return get_all_roles()
