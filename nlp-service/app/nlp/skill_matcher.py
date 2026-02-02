"""
Skill Matcher
Matches user skills against required skills using semantic similarity
"""

import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


class SkillMatcher:
    """Matches skills using exact and fuzzy matching"""
    
    def __init__(self):
        self.model = None
        # Skill synonyms for fuzzy matching
        self.synonyms = {
            "javascript": ["js", "ecmascript", "es6", "es2015"],
            "typescript": ["ts"],
            "react": ["react.js", "reactjs"],
            "vue": ["vue.js", "vuejs"],
            "angular": ["angularjs", "angular.js"],
            "node.js": ["nodejs", "node"],
            "mongodb": ["mongo"],
            "postgresql": ["postgres", "psql"],
            "kubernetes": ["k8s"],
            "amazon web services": ["aws"],
            "google cloud platform": ["gcp", "google cloud"],
            "machine learning": ["ml"],
            "deep learning": ["dl"],
            "natural language processing": ["nlp"],
            "continuous integration": ["ci"],
            "continuous deployment": ["cd"],
            "ci/cd": ["cicd", "ci cd"],
        }
        
        # Build reverse synonym map
        self.reverse_synonyms = {}
        for main_skill, alts in self.synonyms.items():
            for alt in alts:
                self.reverse_synonyms[alt] = main_skill
    
    def _normalize_skill(self, skill: str) -> str:
        """Normalize skill name for comparison"""
        normalized = skill.lower().strip()
        # Check if it's a synonym
        if normalized in self.reverse_synonyms:
            return self.reverse_synonyms[normalized]
        return normalized
    
    def match_skills(
        self, 
        user_skills: List[str], 
        required_skills: List[str]
    ) -> Dict:
        """
        Match user skills against required skills
        
        Args:
            user_skills: List of user's skills
            required_skills: List of required skills for the role
            
        Returns:
            Dictionary with matched skills, gaps, and match score
        """
        # Normalize all skills
        user_normalized = {self._normalize_skill(s) for s in user_skills}
        required_normalized = {self._normalize_skill(s) for s in required_skills}
        
        # Find exact and synonym matches
        matched = set()
        for user_skill in user_normalized:
            if user_skill in required_normalized:
                matched.add(user_skill)
        
        # Find gaps (required but not in user skills)
        gaps = required_normalized - matched
        
        # Calculate match score
        if len(required_normalized) > 0:
            score = (len(matched) / len(required_normalized)) * 100
        else:
            score = 0
        
        # Find original skill names for matched and gaps
        matched_original = self._get_original_names(matched, required_skills)
        gaps_original = self._get_original_names(gaps, required_skills)
        
        logger.info(f"Skill match: {len(matched)}/{len(required_normalized)} = {score:.1f}%")
        
        return {
            "matched": matched_original,
            "gaps": gaps_original,
            "score": round(score, 1),
            "totalRequired": len(required_normalized),
            "totalMatched": len(matched),
        }
    
    def _get_original_names(self, normalized_set: set, original_list: List[str]) -> List[str]:
        """Get original skill names from normalized set"""
        result = []
        for original in original_list:
            if self._normalize_skill(original) in normalized_set:
                result.append(original)
        return result
