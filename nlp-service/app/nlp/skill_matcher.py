"""
Skill Matcher
Matches user skills and resume evidence against target role skill requirements
using a 5-layer verification pipeline (Exact Canonical, Alias, Normalized/Spelling,
Fuzzy Similarity, and Ontological Inference) with explainable evidence,
role-specific weighted scoring, and conservative gap classification.
"""

import re
import difflib
import logging
from typing import List, Dict, Union, Optional, Set, Tuple
from app.nlp.taxonomy import taxonomy, normalize_spelling

logger = logging.getLogger(__name__)


class SkillMatcher:
    """
    Evidence-first 5-layer skill matching engine.
    Ensures that if a skill is present, aliased, variant-spelled, contextually evidenced,
    or demonstrated through an ontological child tool, it is accurately recognized and
    never mistakenly marked as a gap.
    """

    def __init__(self):
        self.taxonomy = taxonomy
        logger.info("SkillMatcher initialized with centralized taxonomy and ontology.")

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
        # 1. Normalize required skills list with role-specific weights
        clean_required: List[Dict] = []
        for req in required_skills:
            if isinstance(req, dict):
                name = req.get("name", "")
                level = req.get("level", "intermediate")
                category = req.get("category", "")
                weight = float(req.get("weight", 1.0))
                importance = req.get("importance", "important")
            else:
                name = str(req)
                level = "intermediate"
                category = ""
                weight = 1.0
                importance = "important"

            canon = self.taxonomy.get_canonical(name)
            clean_required.append({
                "original_name": name,
                "canonical_name": canon,
                "level": level,
                "category": category or self.taxonomy.get_category(canon),
                "weight": weight,
                "importance": importance,
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
            inferred = False
            inferred_from = None

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
            # Layer 2: Direct multi-line resume text verification
            # (Fallback in case extractor missed an inline mention)
            # ----------------------------------------------------
            if status == "missing" and resume_text:
                found_mention, found_alias, found_evidence = self._find_in_text(canon_name, resume_text)
                if found_mention:
                    status = "present"
                    match_via = f"direct resume evidence '{found_alias}'"
                    evidence = [found_evidence] if found_evidence else []
                    confidence = 0.92
                    detected_level = req["level"]

            # ----------------------------------------------------
            # Layer 3: Normalized UK/US spelling & hyphen match
            # ----------------------------------------------------
            if status == "missing":
                norm_canon_key = normalize_spelling(canon_key)
                for u_key, u_comp in user_competencies.items():
                    if normalize_spelling(u_key) == norm_canon_key:
                        status = "present"
                        match_via = f"spelling normalized match '{u_comp['raw_name']}'"
                        evidence = u_comp["evidence"]
                        confidence = round(u_comp["confidence"] * 0.98, 2)
                        detected_level = u_comp["level"]
                        break

            # ----------------------------------------------------
            # Layer 4: Fuzzy String Matching (Threshold >= 0.88)
            # ----------------------------------------------------
            if status == "missing" and len(canon_key) >= 4:
                matched_user_key = self._fuzzy_match(canon_key, list(user_competencies.keys()), threshold=0.88)
                if matched_user_key:
                    u_comp = user_competencies[matched_user_key]
                    status = "present"
                    match_via = f"fuzzy match with '{u_comp['raw_name']}'"
                    evidence = u_comp["evidence"]
                    confidence = round(u_comp["confidence"] * 0.92, 2)
                    detected_level = u_comp["level"]

            # ----------------------------------------------------
            # Layer 5: Intelligent Ontological & Inferred Match
            # (e.g. Power BI demonstrates Data Visualization; PostgreSQL demonstrates SQL)
            # ----------------------------------------------------
            if status == "missing":
                child_tools = self.taxonomy.get_child_tools(canon_name)
                for tool in child_tools:
                    tool_key = tool.lower()
                    if tool_key in user_competencies:
                        u_comp = user_competencies[tool_key]
                        status = "present"
                        match_via = f"inferred via demonstrated tool '{u_comp['raw_name']}'"
                        evidence = [f"Demonstrated proficiency in {orig_name} through {u_comp['raw_name']}"] + u_comp["evidence"][:1]
                        confidence = 0.90
                        detected_level = u_comp["level"]
                        inferred = True
                        inferred_from = tool
                        break

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
                "inferred": inferred,
                "inferred_from": inferred_from,
                "weight": req["weight"],
                "importance": req["importance"],
            }

        # 4. Calculate overall role-weighted match score
        total_required = len(clean_required)
        total_matched = len(matched_original)

        total_weight = sum(r["weight"] for r in clean_required)
        matched_weight = sum(
            r["weight"] for r in clean_required if r["original_name"] in matched_original
        )

        score = (
            min(100.0, max(0.0, round((matched_weight / total_weight) * 100, 1)))
            if total_weight > 0
            else 0.0
        )

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
        Supports both line-by-line and multi-line normalized text search.
        Returns (found: bool, matched_alias: str, evidence_snippet: str).
        """
        aliases = [canonical_name] + self.taxonomy.get_aliases(canonical_name)
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        # 1. Search line-by-line first
        for alias in aliases:
            pattern = self.taxonomy._build_boundary_pattern(alias)
            for line in lines:
                match = pattern.search(line)
                if match:
                    matched_str = match.group(0)
                    evidence = line[:120].strip()
                    return True, matched_str, evidence

        # 2. Search multi-line normalized text (for multi-word skills wrapped across newlines)
        normalized_text = re.sub(r'[\r\n\t]+', ' ', text)
        for alias in aliases:
            pattern = self.taxonomy._build_boundary_pattern(alias)
            match = pattern.search(normalized_text)
            if match:
                matched_str = match.group(0)
                start = max(0, match.start() - 30)
                end = min(len(normalized_text), match.end() + 30)
                evidence = normalized_text[start:end].strip()
                return True, matched_str, evidence

        return False, None, None

    def _fuzzy_match(self, required_term: str, user_terms: List[str], threshold: float = 0.88) -> Optional[str]:
        """
        Fuzzy match a required term against extracted user terms using SequenceMatcher.
        Guarantees strict thresholding to prevent incorrect matches between unrelated skills.
        """
        req_clean = required_term.lower().replace('-', ' ').replace('_', ' ')
        for c in user_terms:
            c_clean = c.lower().replace('-', ' ').replace('_', ' ')
            ratio = difflib.SequenceMatcher(None, req_clean, c_clean).ratio()
            if ratio >= threshold:
                return c
        return None
