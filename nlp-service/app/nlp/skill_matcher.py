"""
Skill Matcher
Matches user skills and resume evidence against target role skill requirements
using layered matching (exact, canonical/alias, contextual verification)
with explainable evidence and conservative gap classification.
"""

import re
import logging
from typing import List, Dict, Union, Optional, Set, Tuple
from app.nlp.taxonomy import taxonomy

logger = logging.getLogger(__name__)


class SkillMatcher:
    """
    Evidence-first skill matching engine.
    Ensures that if a skill is present in the resume or an equivalent canonical alias exists,
    it is NEVER classified as a skill gap.
    """

    def __init__(self):
        self.taxonomy = taxonomy
        logger.info("SkillMatcher initialized with centralized taxonomy.")

    def match_skills(
        self,
        user_skills: List[Union[str, Dict]],
        required_skills: List[Union[str, Dict]],
        resume_text: Optional[str] = None
    ) -> Dict:
        """
        Match user skills against target role required skills.

        Args:
            user_skills: List of extracted skill names or enriched skill dicts
            required_skills: List of required skill names or skill dicts for the role
            resume_text: Optional complete resume text for fallback context verification

        Returns:
            Dictionary containing:
                - matched: List of matched required skill names (backward-compatible)
                - gaps: List of missing required skill names (backward-compatible)
                - partial: List of partially matched skill names
                - score: Match score percentage (0-100)
                - totalRequired: Count of required skills
                - totalMatched: Count of matched skills
                - details: Enriched per-skill assessment including status, confidence, and evidence
        """
        # 1. Normalize required skills list
        clean_required: List[Dict] = []
        for req in required_skills:
            if isinstance(req, dict):
                name = req.get("name", "")
                level = req.get("level", "intermediate")
                category = req.get("category", "")
            else:
                name = str(req)
                level = "intermediate"
                category = ""

            canon = self.taxonomy.get_canonical(name)
            clean_required.append({
                "original_name": name,
                "canonical_name": canon,
                "level": level,
                "category": category or self.taxonomy.get_category(canon),
            })

        # 2. Build index of user competencies
        user_competencies: Dict[str, Dict] = {}
        for item in user_skills:
            if isinstance(item, dict):
                raw = item.get("raw_name") or item.get("name", "")
                canon = item.get("canonical_name") or self.taxonomy.get_canonical(raw)
                evidence = item.get("evidence", [])
                confidence = item.get("confidence", 0.95)
                level = item.get("level", "intermediate")
                category = item.get("category") or self.taxonomy.get_category(canon)
            else:
                raw = str(item)
                canon = self.taxonomy.get_canonical(raw)
                evidence = []
                confidence = 0.95
                level = "intermediate"
                category = self.taxonomy.get_category(canon)

            canon_key = canon.lower()
            if canon_key not in user_competencies or confidence > user_competencies[canon_key]["confidence"]:
                user_competencies[canon_key] = {
                    "canonical_name": canon,
                    "raw_name": raw,
                    "confidence": confidence,
                    "evidence": list(evidence),
                    "level": level,
                    "category": category,
                }
            elif canon_key in user_competencies and evidence:
                # Merge evidence
                for ev in evidence:
                    if ev not in user_competencies[canon_key]["evidence"]:
                        user_competencies[canon_key]["evidence"].append(ev)

        # 3. Match each required skill using layered verification
        matched_original: List[str] = []
        gaps_original: List[str] = []
        partial_original: List[str] = []
        details: Dict[str, Dict] = {}

        for req in clean_required:
            orig_name = req["original_name"]
            canon_name = req["canonical_name"]
            canon_key = canon_name.lower()

            status = "missing"
            match_via = None
            evidence = []
            confidence = 0.0
            detected_level = req["level"]

            # ----------------------------------------------------
            # Layer 1: Canonical / Alias match in user competencies
            # ----------------------------------------------------
            if canon_key in user_competencies:
                comp = user_competencies[canon_key]
                status = "present"
                match_via = f"canonical alias '{comp['raw_name']}'"
                evidence = comp["evidence"]
                confidence = comp["confidence"]
                detected_level = comp["level"]

            # ----------------------------------------------------
            # Layer 2: Direct resume text verification
            # (Fallback in case extractor missed an inline mention)
            # ----------------------------------------------------
            if status == "missing" and resume_text:
                found_mention, found_alias, found_evidence = self._find_in_text(canon_name, resume_text)
                if found_mention:
                    status = "present"
                    match_via = f"direct resume evidence '{found_alias}'"
                    evidence = [found_evidence] if found_evidence else []
                    confidence = 0.92
                    detected_level = "intermediate"

            # ----------------------------------------------------
            # Final Classification
            # ----------------------------------------------------
            if status == "present":
                matched_original.append(orig_name)
                logger.info(f"Skill Match: '{orig_name}' (Canonical: '{canon_name}') -> PRESENT via {match_via}")
            else:
                gaps_original.append(orig_name)
                logger.info(f"Skill Gap:   '{orig_name}' (Canonical: '{canon_name}') -> MISSING (No evidence in resume)")

            details[orig_name] = {
                "name": orig_name,
                "canonical_name": canon_name,
                "status": status,
                "confidence": confidence,
                "evidence": evidence,
                "level": detected_level,
                "category": req["category"],
            }

        # 4. Calculate overall match score
        total_required = len(clean_required)
        total_matched = len(matched_original)
        score = round((total_matched / total_required) * 100, 1) if total_required > 0 else 0.0

        return {
            "matched": matched_original,
            "gaps": gaps_original,
            "partial": partial_original,
            "score": score,
            "totalRequired": total_required,
            "totalMatched": total_matched,
            "details": details,
        }

    def _find_in_text(self, canonical_name: str, text: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Directly verify if a canonical skill or any of its aliases exists in raw resume text.
        Returns (found: bool, matched_alias: str, evidence_snippet: str).
        """
        aliases = [canonical_name] + self.taxonomy.get_aliases(canonical_name)
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        for alias in aliases:
            pattern = self.taxonomy._build_boundary_pattern(alias)
            for line in lines:
                match = pattern.search(line)
                if match:
                    matched_str = match.group(0)
                    evidence = line[:120].strip()
                    return True, matched_str, evidence

        return False, None, None
