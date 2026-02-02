"""
Job Roles Utility
Contains job role definitions and required skills
"""

from typing import List, Dict, Optional

# Job roles with required skills
JOB_ROLES = {
    "frontend-developer": {
        "label": "Frontend Developer",
        "skills": [
            {"name": "JavaScript", "level": "advanced", "category": "programming"},
            {"name": "HTML", "level": "advanced", "category": "frontend"},
            {"name": "CSS", "level": "advanced", "category": "frontend"},
            {"name": "React", "level": "advanced", "category": "frontend"},
            {"name": "TypeScript", "level": "intermediate", "category": "programming"},
            {"name": "Git", "level": "intermediate", "category": "tools"},
            {"name": "REST API", "level": "intermediate", "category": "tools"},
            {"name": "Tailwind", "level": "intermediate", "category": "frontend"},
            {"name": "Redux", "level": "intermediate", "category": "frontend"},
            {"name": "Jest", "level": "beginner", "category": "tools"},
        ]
    },
    "backend-developer": {
        "label": "Backend Developer",
        "skills": [
            {"name": "Node.js", "level": "advanced", "category": "backend"},
            {"name": "JavaScript", "level": "advanced", "category": "programming"},
            {"name": "Python", "level": "intermediate", "category": "programming"},
            {"name": "SQL", "level": "advanced", "category": "database"},
            {"name": "MongoDB", "level": "intermediate", "category": "database"},
            {"name": "REST API", "level": "advanced", "category": "tools"},
            {"name": "Git", "level": "intermediate", "category": "tools"},
            {"name": "Docker", "level": "intermediate", "category": "cloud_devops"},
            {"name": "Express", "level": "advanced", "category": "backend"},
            {"name": "PostgreSQL", "level": "intermediate", "category": "database"},
        ]
    },
    "fullstack-developer": {
        "label": "Full Stack Developer",
        "skills": [
            {"name": "JavaScript", "level": "advanced", "category": "programming"},
            {"name": "React", "level": "advanced", "category": "frontend"},
            {"name": "Node.js", "level": "advanced", "category": "backend"},
            {"name": "HTML", "level": "advanced", "category": "frontend"},
            {"name": "CSS", "level": "advanced", "category": "frontend"},
            {"name": "MongoDB", "level": "intermediate", "category": "database"},
            {"name": "SQL", "level": "intermediate", "category": "database"},
            {"name": "Git", "level": "intermediate", "category": "tools"},
            {"name": "Docker", "level": "beginner", "category": "cloud_devops"},
            {"name": "REST API", "level": "advanced", "category": "tools"},
            {"name": "TypeScript", "level": "intermediate", "category": "programming"},
        ]
    },
    "data-scientist": {
        "label": "Data Scientist",
        "skills": [
            {"name": "Python", "level": "advanced", "category": "programming"},
            {"name": "Machine Learning", "level": "advanced", "category": "data_ml"},
            {"name": "Pandas", "level": "advanced", "category": "data_ml"},
            {"name": "NumPy", "level": "advanced", "category": "data_ml"},
            {"name": "Scikit-learn", "level": "advanced", "category": "data_ml"},
            {"name": "TensorFlow", "level": "intermediate", "category": "data_ml"},
            {"name": "SQL", "level": "intermediate", "category": "database"},
            {"name": "Matplotlib", "level": "intermediate", "category": "data_ml"},
            {"name": "Statistics", "level": "advanced", "category": "data_ml"},
            {"name": "Deep Learning", "level": "intermediate", "category": "data_ml"},
        ]
    },
    "data-analyst": {
        "label": "Data Analyst",
        "skills": [
            {"name": "SQL", "level": "advanced", "category": "database"},
            {"name": "Excel", "level": "advanced", "category": "tools"},
            {"name": "Python", "level": "intermediate", "category": "programming"},
            {"name": "Pandas", "level": "intermediate", "category": "data_ml"},
            {"name": "Data Visualization", "level": "advanced", "category": "data_ml"},
            {"name": "Tableau", "level": "intermediate", "category": "tools"},
            {"name": "Statistics", "level": "intermediate", "category": "data_ml"},
            {"name": "Power BI", "level": "intermediate", "category": "tools"},
        ]
    },
    "devops-engineer": {
        "label": "DevOps Engineer",
        "skills": [
            {"name": "Docker", "level": "advanced", "category": "cloud_devops"},
            {"name": "Kubernetes", "level": "advanced", "category": "cloud_devops"},
            {"name": "AWS", "level": "advanced", "category": "cloud_devops"},
            {"name": "Linux", "level": "advanced", "category": "cloud_devops"},
            {"name": "Bash", "level": "advanced", "category": "cloud_devops"},
            {"name": "CI/CD", "level": "advanced", "category": "cloud_devops"},
            {"name": "Terraform", "level": "intermediate", "category": "cloud_devops"},
            {"name": "Git", "level": "advanced", "category": "tools"},
            {"name": "Python", "level": "intermediate", "category": "programming"},
            {"name": "Jenkins", "level": "intermediate", "category": "cloud_devops"},
        ]
    },
    "ml-engineer": {
        "label": "Machine Learning Engineer",
        "skills": [
            {"name": "Python", "level": "advanced", "category": "programming"},
            {"name": "Machine Learning", "level": "advanced", "category": "data_ml"},
            {"name": "TensorFlow", "level": "advanced", "category": "data_ml"},
            {"name": "PyTorch", "level": "advanced", "category": "data_ml"},
            {"name": "Deep Learning", "level": "advanced", "category": "data_ml"},
            {"name": "Docker", "level": "intermediate", "category": "cloud_devops"},
            {"name": "AWS", "level": "intermediate", "category": "cloud_devops"},
            {"name": "Scikit-learn", "level": "advanced", "category": "data_ml"},
            {"name": "MLOps", "level": "intermediate", "category": "data_ml"},
            {"name": "SQL", "level": "intermediate", "category": "database"},
        ]
    },
    "cloud-architect": {
        "label": "Cloud Architect",
        "skills": [
            {"name": "AWS", "level": "advanced", "category": "cloud_devops"},
            {"name": "Azure", "level": "advanced", "category": "cloud_devops"},
            {"name": "GCP", "level": "intermediate", "category": "cloud_devops"},
            {"name": "Terraform", "level": "advanced", "category": "cloud_devops"},
            {"name": "Kubernetes", "level": "advanced", "category": "cloud_devops"},
            {"name": "Docker", "level": "advanced", "category": "cloud_devops"},
            {"name": "Networking", "level": "advanced", "category": "cloud_devops"},
            {"name": "Security", "level": "advanced", "category": "cloud_devops"},
            {"name": "Microservices", "level": "advanced", "category": "tools"},
        ]
    },
    "product-manager": {
        "label": "Product Manager",
        "skills": [
            {"name": "Product Strategy", "level": "advanced", "category": "tools"},
            {"name": "Agile", "level": "advanced", "category": "tools"},
            {"name": "Scrum", "level": "advanced", "category": "tools"},
            {"name": "Data Analysis", "level": "intermediate", "category": "data_ml"},
            {"name": "User Research", "level": "advanced", "category": "tools"},
            {"name": "Jira", "level": "intermediate", "category": "tools"},
            {"name": "SQL", "level": "beginner", "category": "database"},
            {"name": "A/B Testing", "level": "intermediate", "category": "tools"},
        ]
    },
    "ui-ux-designer": {
        "label": "UI/UX Designer",
        "skills": [
            {"name": "Figma", "level": "advanced", "category": "tools"},
            {"name": "UI Design", "level": "advanced", "category": "frontend"},
            {"name": "UX Research", "level": "advanced", "category": "tools"},
            {"name": "Prototyping", "level": "advanced", "category": "tools"},
            {"name": "Adobe XD", "level": "intermediate", "category": "tools"},
            {"name": "CSS", "level": "intermediate", "category": "frontend"},
            {"name": "HTML", "level": "intermediate", "category": "frontend"},
            {"name": "Design Systems", "level": "intermediate", "category": "tools"},
            {"name": "User Testing", "level": "intermediate", "category": "tools"},
        ]
    },
}


def get_required_skills(role_id: str) -> List[Dict]:
    """Get required skills for a job role"""
    role = JOB_ROLES.get(role_id)
    if role:
        return role["skills"]
    return []


def get_all_roles() -> List[Dict]:
    """Get all available job roles"""
    return [
        {"id": role_id, "label": role_data["label"]}
        for role_id, role_data in JOB_ROLES.items()
    ]


def get_role_label(role_id: str) -> Optional[str]:
    """Get the label for a job role"""
    role = JOB_ROLES.get(role_id)
    return role["label"] if role else None
