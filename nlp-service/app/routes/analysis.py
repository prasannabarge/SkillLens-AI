"""
Analysis Routes
Resume analysis and skill extraction endpoints
"""

import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional

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
    """Model for a skill item"""
    name: str
    level: Optional[str] = "intermediate"
    category: Optional[str] = None
    confidence: Optional[float] = None


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
    - Extracts skills using NLP
    - Compares with required skills for target role
    - Identifies skill gaps
    - Generates recommendations
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
        
        if not extracted_text or len(extracted_text.strip()) < 20:
            # Fallback: try to decode as plain text
            try:
                extracted_text = file_bytes.decode('utf-8', errors='ignore')
            except:
                raise HTTPException(
                    status_code=400, 
                    detail="Could not extract text from resume. Please upload a text-based PDF or TXT file."
                )
        
        logger.info(f"Extracted {len(extracted_text)} characters from resume")
        
        # Extract skills from resume
        extracted_skills = skill_extractor.extract_skills(extracted_text)
        logger.info(f"Extracted {len(extracted_skills)} skills")
        
        # Get required skills for target role
        required_skills = get_required_skills(target_role)
        logger.info(f"Required skills for {target_role}: {len(required_skills)}")
        
        # Match skills and find gaps
        match_result = skill_matcher.match_skills(
            user_skills=[s["name"] for s in extracted_skills],
            required_skills=[s["name"] for s in required_skills]
        )
        
        # Build response
        return AnalyzeResponse(
            extracted_text=extracted_text[:5000],  # Limit text size
            extracted_skills=[SkillItem(**s) for s in extracted_skills],
            required_skills=[SkillItem(**s) for s in required_skills],
            matched_skills=[SkillItem(name=s) for s in match_result["matched"]],
            gap_skills=[SkillItem(name=s, level="beginner") for s in match_result["gaps"]],
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
    userSkills: List[str]
    requiredSkills: List[str]


@router.post("/match")
async def match_skills(request: MatchRequest):
    """
    Match user skills against required skills
    Uses semantic similarity for fuzzy matching
    """
    try:
        result = skill_matcher.match_skills(
            user_skills=request.userSkills,
            required_skills=request.requiredSkills
        )
        return result
    except Exception as e:
        logger.error(f"Matching error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


def generate_recommendations(gap_skills: List[str]) -> List[Recommendation]:
    """Generate learning recommendations based on skill gaps"""
    recommendations = []
    
    for i, skill in enumerate(gap_skills):
        # Prioritize first few skills as high priority
        if i < len(gap_skills) // 3:
            priority = "high"
            reason = f"{skill} is a core requirement for this role"
        elif i < 2 * len(gap_skills) // 3:
            priority = "medium"
            reason = f"{skill} would strengthen your profile"
        else:
            priority = "low"
            reason = f"{skill} is a nice-to-have skill"
            
        recommendations.append(Recommendation(
            skill=skill,
            priority=priority,
            reason=reason
        ))
    
    return recommendations
