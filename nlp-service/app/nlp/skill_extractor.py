"""
Skill Extractor
Extracts technical skills, version aliases, and competencies from resume text
using the centralized taxonomy, section awareness, and contextual evidence extraction.
"""

import re
import logging
from typing import List, Dict, Optional, Tuple, Set
from app.nlp.taxonomy import taxonomy

logger = logging.getLogger(__name__)

# Section header patterns
SECTION_PATTERNS = [
    (re.compile(r'^(technical\s+skills?|skills?(\s*(&|and)\s*abilities)?|core\s+competencies|technologies|tech\s+stack|tools(\s*(&|and)\s*technologies)?|proficiencies)\b', re.IGNORECASE), "skills"),
    (re.compile(r'^(work\s+experience|professional\s+experience|employment\s+history|experience|career\s+history)\b', re.IGNORECASE), "experience"),
    (re.compile(r'^(projects?|personal\s+projects?|academic\s+projects?|key\s+projects?|notable\s+projects?)\b', re.IGNORECASE), "projects"),
    (re.compile(r'^(education|academic\s+background|qualifications|academic\s+history)\b', re.IGNORECASE), "education"),
    (re.compile(r'^(certifications?|certificates?|licenses?|credentials?)\b', re.IGNORECASE), "certifications"),
    (re.compile(r'^(summary|professional\s+summary|about\s+me|profile|objective|career\s+objective)\b', re.IGNORECASE), "summary"),
]

# Context words indicative of advanced/expert proficiency
ADVANCED_INDICATORS = [
    re.compile(r'\b(expert|mastery|advanced|senior|lead|principal|architect|specialist)\b', re.IGNORECASE),
    re.compile(r'\b(proficient\s+in|extensive\s+experience|deep\s+understanding)\b', re.IGNORECASE),
    re.compile(r'\b([4-9]|\d{2})\+?\s*(years?|yrs?)\b', re.IGNORECASE),
]

# Context words indicative of beginner proficiency
BEGINNER_INDICATORS = [
    re.compile(r'\b(beginner|basic|familiar\s+with|exposure\s+to|knowledge\s+of|novice|learning)\b', re.IGNORECASE),
]


class SkillExtractor:
    """
    Extracts skills from text using centralized taxonomy and context-aware evidence collection.
    """

    def __init__(self):
        self.taxonomy = taxonomy
        logger.info("SkillExtractor initialized with centralized taxonomy.")

    def extract_skills(self, text: str) -> List[Dict]:
        """
        Extract skills from resume text.

        Args:
            text: Resume text content

        Returns:
            List of extracted skills with canonical name, raw name, category,
            confidence score, evidence snippets, section context, and estimated level.
        """
        if not text or not text.strip():
            return []

        # 1. Segment text into sections and contextual snippets
        sections = self._segment_into_sections(text)

        # 2. Match skills against sections
        # Map: canonical_name -> aggregated skill dict
        found_skills: Dict[str, Dict] = {}

        for pattern, canonical_name, raw_term, category in self.taxonomy.compiled_patterns:
            for section_name, lines in sections:
                for line in lines:
                    match = pattern.search(line)
                    if match:
                        matched_str = match.group(0)
                        evidence_str = self._format_evidence(line, match.start(), match.end())
                        level = self._estimate_level(line, matched_str)
                        confidence = self._calculate_confidence(section_name, line)

                        if canonical_name not in found_skills:
                            found_skills[canonical_name] = {
                                "name": canonical_name,
                                "raw_name": matched_str,
                                "canonical_name": canonical_name,
                                "category": category,
                                "level": level,
                                "confidence": confidence,
                                "evidence": [evidence_str] if evidence_str else [],
                                "section": section_name,
                                "mention_count": 1,
                            }
                        else:
                            # Update existing record
                            existing = found_skills[canonical_name]
                            existing["mention_count"] += 1
                            # Bump confidence if multiple mentions
                            existing["confidence"] = min(1.0, round(existing["confidence"] + 0.05, 2))
                            # Keep highest level
                            if self._level_rank(level) > self._level_rank(existing["level"]):
                                existing["level"] = level
                            # Accumulate unique evidence (up to 3 distinct lines)
                            if evidence_str and evidence_str not in existing["evidence"] and len(existing["evidence"]) < 3:
                                existing["evidence"].append(evidence_str)

        # Sort by confidence descending, then name ascending
        skills_list = list(found_skills.values())
        skills_list.sort(key=lambda x: (-x["confidence"], x["name"]))

        logger.info(f"Extracted {len(skills_list)} canonical skills from resume")
        return skills_list

    def _segment_into_sections(self, text: str) -> List[Tuple[str, List[str]]]:
        """
        Segment resume text into logical sections (e.g. skills, experience, projects).
        Guarantees that lines with inline skills after headers like 'Skills: HTML, CSS'
        are retained for analysis.
        """
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        sections: List[Tuple[str, List[str]]] = []
        current_section = "general"
        current_lines: List[str] = []

        for line in lines:
            header_info = self._detect_section_header(line)
            if header_info:
                section_name, inline_content = header_info
                if current_lines:
                    sections.append((current_section, current_lines))
                    current_lines = []
                current_section = section_name
                if inline_content:
                    current_lines.append(inline_content)
            else:
                current_lines.append(line)

        if current_lines:
            sections.append((current_section, current_lines))

        # Fallback to ensure text is never lost
        if not sections and lines:
            sections.append(("general", lines))

        return sections

    def _detect_section_header(self, line: str) -> Optional[Tuple[str, str]]:
        """
        Check if a line represents a section header.
        Returns (section_name, inline_content_after_header) or None.
        """
        cleaned = re.sub(r'^[•\-\*\#\d\.\:\s]+', '', line).strip()

        for pattern, section_name in SECTION_PATTERNS:
            match = pattern.search(cleaned)
            if match and match.start() == 0:
                # The line starts with the header
                # Check what follows (e.g. ':', '-', or nothing)
                remainder = cleaned[match.end():].strip()
                # Strip leading colon, dash, or whitespace
                remainder = re.sub(r'^[\:\-\|\—\–\s]+', '', remainder).strip()
                # If there's no remainder, this was a standalone header line
                return (section_name, remainder)

        return None


    def _format_evidence(self, line: str, start: int, end: int) -> str:
        """Format a clean, concise evidence snippet around the match."""
        cleaned = line.strip()
        # Remove leading bullet characters
        cleaned = re.sub(r'^[•\-\*\+\s]+', '', cleaned).strip()
        # Cap length at 120 chars
        if len(cleaned) > 120:
            # Center around the match
            center = (start + end) // 2
            half = 55
            sub_start = max(0, center - half)
            sub_end = min(len(cleaned), center + half)
            snippet = cleaned[sub_start:sub_end].strip()
            if sub_start > 0:
                snippet = "..." + snippet
            if sub_end < len(cleaned):
                snippet = snippet + "..."
            return snippet
        return cleaned

    def _calculate_confidence(self, section: str, line: str) -> float:
        """Calculate confidence score based on section context and structure."""
        if section == "skills":
            return 0.99
        elif section in ("experience", "projects"):
            return 0.95
        elif section in ("summary", "certifications"):
            return 0.92
        elif section == "education":
            return 0.88
        return 0.85

    def _estimate_level(self, line: str, skill_matched: str) -> str:
        """Estimate skill proficiency level from contextual clues."""
        line_lower = line.lower()

        # Check beginner indicators
        for pattern in BEGINNER_INDICATORS:
            if pattern.search(line_lower):
                return "beginner"

        # Check advanced/expert indicators
        for pattern in ADVANCED_INDICATORS:
            if pattern.search(line_lower):
                return "advanced"

        return "intermediate"

    @staticmethod
    def _level_rank(level: str) -> int:
        ranks = {"beginner": 1, "intermediate": 2, "advanced": 3, "expert": 4}
        return ranks.get(level.lower(), 2)
