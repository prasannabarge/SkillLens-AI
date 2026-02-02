"""
Skill Extractor
Extracts skills from resume text using NLP
"""

import re
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

# Comprehensive skill database (expandable)
SKILL_PATTERNS = {
    # Programming Languages
    "programming": [
        "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust",
        "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "MATLAB", "Perl",
    ],
    # Frontend
    "frontend": [
        "React", "React.js", "Vue", "Vue.js", "Angular", "Svelte", "Next.js",
        "HTML", "HTML5", "CSS", "CSS3", "Sass", "SCSS", "Less", "Tailwind",
        "Bootstrap", "Material UI", "Redux", "Zustand", "jQuery",
    ],
    # Backend
    "backend": [
        "Node.js", "Express", "Express.js", "Django", "Flask", "FastAPI",
        "Spring", "Spring Boot", ".NET", "ASP.NET", "Rails", "Laravel",
        "NestJS", "Koa", "Hapi",
    ],
    # Databases
    "database": [
        "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Redis", "Elasticsearch",
        "Cassandra", "DynamoDB", "Firebase", "Supabase", "Oracle", "SQL Server",
        "Neo4j", "GraphQL", "Prisma",
    ],
    # Cloud & DevOps
    "cloud_devops": [
        "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "K8s",
        "Terraform", "Ansible", "Jenkins", "GitHub Actions", "GitLab CI",
        "CircleCI", "Travis CI", "Nginx", "Apache", "Linux", "Bash",
    ],
    # Data Science & ML
    "data_ml": [
        "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras",
        "Scikit-learn", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Jupyter",
        "NLP", "Computer Vision", "Neural Networks", "AI", "Data Science",
    ],
    # Tools & Practices
    "tools": [
        "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence", "Trello",
        "Agile", "Scrum", "CI/CD", "REST API", "GraphQL", "Microservices",
        "Unit Testing", "Jest", "Pytest", "Mocha", "Cypress",
    ],
}


class SkillExtractor:
    """Extracts skills from text using pattern matching and NLP"""
    
    def __init__(self):
        # Build flat skill list for matching
        self.all_skills = {}
        for category, skills in SKILL_PATTERNS.items():
            for skill in skills:
                self.all_skills[skill.lower()] = {
                    "name": skill,
                    "category": category
                }
        
        # Compile regex patterns for each skill
        self.patterns = []
        for skill_lower, skill_data in self.all_skills.items():
            # Create pattern that matches whole words
            pattern = re.compile(
                r'\b' + re.escape(skill_data["name"]) + r'\b',
                re.IGNORECASE
            )
            self.patterns.append((pattern, skill_data))
    
    def extract_skills(self, text: str) -> List[Dict]:
        """
        Extract skills from resume text
        
        Args:
            text: Resume text content
            
        Returns:
            List of extracted skills with metadata
        """
        found_skills = {}
        
        for pattern, skill_data in self.patterns:
            matches = pattern.findall(text)
            if matches:
                skill_name = skill_data["name"]
                if skill_name not in found_skills:
                    # Calculate confidence based on number of mentions
                    confidence = min(0.5 + (len(matches) * 0.1), 1.0)
                    
                    found_skills[skill_name] = {
                        "name": skill_name,
                        "category": skill_data["category"],
                        "level": self._estimate_level(text, skill_name),
                        "confidence": round(confidence, 2),
                    }
        
        # Sort by confidence
        skills_list = list(found_skills.values())
        skills_list.sort(key=lambda x: x["confidence"], reverse=True)
        
        logger.info(f"Extracted {len(skills_list)} skills from resume")
        return skills_list
    
    def _estimate_level(self, text: str, skill: str) -> str:
        """
        Estimate skill level based on context clues
        """
        text_lower = text.lower()
        skill_lower = skill.lower()
        
        # Check for expert/advanced indicators
        expert_patterns = [
            f"expert in {skill_lower}",
            f"advanced {skill_lower}",
            f"senior {skill_lower}",
            f"lead {skill_lower}",
            f"architect",
        ]
        for pattern in expert_patterns:
            if pattern in text_lower:
                return "advanced"
        
        # Check for intermediate indicators
        intermediate_patterns = [
            f"experience with {skill_lower}",
            f"proficient in {skill_lower}",
            f"worked with {skill_lower}",
        ]
        for pattern in intermediate_patterns:
            if pattern in text_lower:
                return "intermediate"
        
        return "intermediate"  # Default to intermediate
