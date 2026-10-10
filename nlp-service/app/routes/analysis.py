"""
Analysis Routes
Resume analysis and skill extraction endpoints
"""

import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional, Union

from app.nlp.skill_extractor import SkillExtractor
from app.nlp.skill_matcher import SkillMatcher
from app.parsers.resume_parser import ResumeParser
from app.utils.job_roles import get_required_skills

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize services
skill_extractor = SkillExtractor()
skill_matcher = SkillMatcher()
resume_parser = ResumeParser()


class SkillItem(BaseModel):
    """Model for a skill item with rich evidence and status metadata"""
    name: str
    level: Optional[str] = "intermediate"
    category: Optional[str] = None
    confidence: Optional[float] = None
    canonical_name: Optional[str] = None
    raw_name: Optional[str] = None
    status: Optional[str] = None
    evidence: Optional[List[str]] = None


class Recommendation(BaseModel):
    """Model for skill recommendation"""
    skill: str
    priority: str
    reason: str


class AnalyzeResponse(BaseModel):
    """Response model for resume analysis"""
    extracted_text: str
    extracted_skills: List[SkillItem]
    required_skills: List[SkillItem]
    matched_skills: List[SkillItem]
    gap_skills: List[SkillItem]
    match_score: float
    recommendations: List[Recommendation]


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_resume(
    file: UploadFile = File(...),
    target_role: str = Form(...)
):
    """
    Analyze a resume file and extract skills
    
    - Accepts multipart file upload
    - Parses the resume file
    - Extracts skills using centralized taxonomy & NLP
    - Compares with required skills for target role
    - Identifies genuine skill gaps
    - Generates actionable recommendations
    """
    try:
        logger.info(f"Received file: {file.filename}, target_role: {target_role}")
        
        # Read file bytes
        file_bytes = await file.read()
        
        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Empty file uploaded"
            )
        
        # Parse resume text
        try:
            extracted_text = resume_parser.parse(file_bytes)
        except Exception as e:
            logger.error(f"Resume parsing error: {str(e)}")
            extracted_text = ""
        
        if not extracted_text or len(extracted_text.strip()) < 10:
            # Fallback: try to decode as plain text
            try:
                extracted_text = file_bytes.decode('utf-8', errors='ignore')
            except:
                raise HTTPException(
                    status_code=400, 
                    detail="Could not extract text from resume. Please upload a text-based PDF, DOCX, or TXT file."
                )
        
        logger.info(f"Extracted {len(extracted_text)} characters from resume")
        
        # Extract skills from resume
        extracted_skills = skill_extractor.extract_skills(extracted_text)
        logger.info(f"Extracted {len(extracted_skills)} skills")
        
        # Get required skills for target role
        required_skills = get_required_skills(target_role)
        logger.info(f"Required skills for {target_role}: {len(required_skills)}")
        
        # Match skills and find gaps using layered matching
        match_result = skill_matcher.match_skills(
            user_skills=extracted_skills,
            required_skills=required_skills,
            resume_text=extracted_text
        )
        
        details = match_result.get("details", {})

        # Build matched skills with evidence
        matched_items = []
        for s in match_result["matched"]:
            detail = details.get(s, {})
            matched_items.append(SkillItem(
                name=s,
                level=detail.get("level", "intermediate"),
                category=detail.get("category", "other"),
                confidence=detail.get("confidence", 0.95),
                canonical_name=detail.get("canonical_name", s),
                status="present",
                evidence=detail.get("evidence", [])
            ))

        # Build gap skills
        gap_items = []
        for s in match_result["gaps"]:
            detail = details.get(s, {})
            gap_items.append(SkillItem(
                name=s,
                level="beginner",
                category=detail.get("category", "other"),
                confidence=0.0,
                canonical_name=detail.get("canonical_name", s),
                status="missing",
                evidence=[]
            ))

        # Build extracted skills items
        extracted_items = [
            SkillItem(
                name=s.get("name", ""),
                level=s.get("level", "intermediate"),
                category=s.get("category", "other"),
                confidence=s.get("confidence", 0.95),
                canonical_name=s.get("canonical_name", s.get("name", "")),
                raw_name=s.get("raw_name"),
                status="present",
                evidence=s.get("evidence", [])
            )
            for s in extracted_skills
        ]

        # Build required skills items
        required_items = [
            SkillItem(
                name=s.get("name", ""),
                level=s.get("level", "intermediate"),
                category=s.get("category", "other")
            )
            for s in required_skills
        ]

        # Build response
        return AnalyzeResponse(
            extracted_text=extracted_text[:5000],  # Limit text size
            extracted_skills=extracted_items,
            required_skills=required_items,
            matched_skills=matched_items,
            gap_skills=gap_items,
            match_score=match_result["score"],
            recommendations=generate_recommendations(match_result["gaps"])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


class MatchRequest(BaseModel):
    """Request model for skill matching"""
    userSkills: List[Union[str, dict]]
    requiredSkills: List[Union[str, dict]]
    resumeText: Optional[str] = None


@router.post("/match")
async def match_skills(request: MatchRequest):
    """
    Match user skills against required skills
    Uses centralized taxonomy and layered matching
    """
    try:
        result = skill_matcher.match_skills(
            user_skills=request.userSkills,
            required_skills=request.requiredSkills,
            resume_text=request.resumeText
        )
        return result
    except Exception as e:
        logger.error(f"Matching error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


def generate_recommendations(gap_skills: List[str]) -> List[Recommendation]:
    """Generate learning recommendations based on genuine skill gaps"""
    recommendations = []
    
    for i, skill in enumerate(gap_skills):
        # Prioritize first few skills as high priority
        if i < len(gap_skills) // 3 or i < 2:
            priority = "high"
            reason = f"{skill} is a core requirement for this role"
        elif i < 2 * len(gap_skills) // 3 or i < 4:
            priority = "medium"
            reason = f"{skill} would strengthen your competitive profile"
        else:
            priority = "low"
            reason = f"{skill} is an advantageous skill to broaden your capability"
            
        recommendations.append(Recommendation(
            skill=skill,
            priority=priority,
            reason=reason
        ))
    
    return recommendations
