"""
Job Roles Utility
Contains job role definitions and required skills
"""

from typing import List, Dict, Optional

# Job roles with required skills, categories, proficiency levels, and role-specific weights
JOB_ROLES = {
    "frontend-developer": {
        "label": "Frontend Developer",
        "skills": [
            {"name": "JavaScript", "level": "advanced", "category": "programming", "weight": 1.3, "importance": "critical"},
            {"name": "HTML", "level": "advanced", "category": "frontend", "weight": 1.2, "importance": "critical"},
            {"name": "CSS", "level": "advanced", "category": "frontend", "weight": 1.2, "importance": "critical"},
            {"name": "React", "level": "advanced", "category": "frontend", "weight": 1.3, "importance": "critical"},
            {"name": "TypeScript", "level": "intermediate", "category": "programming", "weight": 1.0, "importance": "important"},
            {"name": "Git", "level": "intermediate", "category": "tools", "weight": 1.0, "importance": "important"},
            {"name": "REST API", "level": "intermediate", "category": "tools", "weight": 1.0, "importance": "important"},
            {"name": "Tailwind", "level": "intermediate", "category": "frontend", "weight": 0.8, "importance": "supporting"},
            {"name": "Redux", "level": "intermediate", "category": "frontend", "weight": 0.8, "importance": "supporting"},
            {"name": "Jest", "level": "beginner", "category": "tools", "weight": 0.8, "importance": "supporting"},
        ]
    },
    "backend-developer": {
        "label": "Backend Developer",
        "skills": [
            {"name": "Node.js", "level": "advanced", "category": "backend", "weight": 1.3, "importance": "critical"},
            {"name": "SQL", "level": "advanced", "category": "database", "weight": 1.3, "importance": "critical"},
            {"name": "REST API", "level": "advanced", "category": "tools", "weight": 1.2, "importance": "critical"},
            {"name": "Express", "level": "advanced", "category": "backend", "weight": 1.2, "importance": "critical"},
            {"name": "JavaScript", "level": "advanced", "category": "programming", "weight": 1.0, "importance": "important"},
            {"name": "Python", "level": "intermediate", "category": "programming", "weight": 1.0, "importance": "important"},
            {"name": "MongoDB", "level": "intermediate", "category": "database", "weight": 1.0, "importance": "important"},
            {"name": "PostgreSQL", "level": "intermediate", "category": "database", "weight": 1.0, "importance": "important"},
            {"name": "Git", "level": "intermediate", "category": "tools", "weight": 0.8, "importance": "supporting"},
            {"name": "Docker", "level": "intermediate", "category": "cloud_devops", "weight": 0.8, "importance": "supporting"},
        ]
    },
    "fullstack-developer": {
        "label": "Full Stack Developer",
        "skills": [
            {"name": "JavaScript", "level": "advanced", "category": "programming", "weight": 1.3, "importance": "critical"},
            {"name": "React", "level": "advanced", "category": "frontend", "weight": 1.2, "importance": "critical"},
            {"name": "Node.js", "level": "advanced", "category": "backend", "weight": 1.2, "importance": "critical"},
            {"name": "SQL", "level": "intermediate", "category": "database", "weight": 1.2, "importance": "critical"},
            {"name": "HTML", "level": "advanced", "category": "frontend", "weight": 1.0, "importance": "important"},
            {"name": "CSS", "level": "advanced", "category": "frontend", "weight": 1.0, "importance": "important"},
            {"name": "MongoDB", "level": "intermediate", "category": "database", "weight": 1.0, "importance": "important"},
            {"name": "REST API", "level": "advanced", "category": "tools", "weight": 1.0, "importance": "important"},
            {"name": "Git", "level": "intermediate", "category": "tools", "weight": 0.8, "importance": "supporting"},
            {"name": "Docker", "level": "beginner", "category": "cloud_devops", "weight": 0.8, "importance": "supporting"},
            {"name": "TypeScript", "level": "intermediate", "category": "programming", "weight": 0.8, "importance": "supporting"},
        ]
    },
    "data-scientist": {
        "label": "Data Scientist",
        "skills": [
            {"name": "Python", "level": "advanced", "category": "programming", "weight": 1.3, "importance": "critical"},
            {"name": "Machine Learning", "level": "advanced", "category": "data_ml", "weight": 1.3, "importance": "critical"},
            {"name": "Pandas", "level": "advanced", "category": "data_ml", "weight": 1.2, "importance": "critical"},
            {"name": "Statistics", "level": "advanced", "category": "data_ml", "weight": 1.2, "importance": "critical"},
            {"name": "NumPy", "level": "advanced", "category": "data_ml", "weight": 1.0, "importance": "important"},
            {"name": "Scikit-learn", "level": "advanced", "category": "data_ml", "weight": 1.0, "importance": "important"},
            {"name": "SQL", "level": "intermediate", "category": "database", "weight": 1.0, "importance": "important"},
            {"name": "TensorFlow", "level": "intermediate", "category": "data_ml", "weight": 0.8, "importance": "supporting"},
            {"name": "Matplotlib", "level": "intermediate", "category": "data_ml", "weight": 0.8, "importance": "supporting"},
            {"name": "Deep Learning", "level": "intermediate", "category": "data_ml", "weight": 0.8, "importance": "supporting"},
        ]
    },
    "data-analyst": {
        "label": "Data Analyst",
        "skills": [
            {"name": "SQL", "level": "advanced", "category": "database", "weight": 1.3, "importance": "critical"},
            {"name": "Data Visualization", "level": "advanced", "category": "data_ml", "weight": 1.3, "importance": "critical"},
            {"name": "Excel", "level": "advanced", "category": "tools", "weight": 1.2, "importance": "critical"},
            {"name": "Python", "level": "intermediate", "category": "programming", "weight": 1.0, "importance": "important"},
            {"name": "Pandas", "level": "intermediate", "category": "data_ml", "weight": 1.0, "importance": "important"},
            {"name": "Statistics", "level": "intermediate", "category": "data_ml", "weight": 1.0, "importance": "important"},
            {"name": "Power BI", "level": "intermediate", "category": "tools", "weight": 0.8, "importance": "supporting"},
            {"name": "Tableau", "level": "intermediate", "category": "tools", "weight": 0.8, "importance": "supporting"},
        ]
    },
    "devops-engineer": {
        "label": "DevOps Engineer",
        "skills": [
            {"name": "Docker", "level": "advanced", "category": "cloud_devops", "weight": 1.3, "importance": "critical"},
            {"name": "Kubernetes", "level": "advanced", "category": "cloud_devops", "weight": 1.3, "importance": "critical"},
            {"name": "CI/CD", "level": "advanced", "category": "cloud_devops", "weight": 1.3, "importance": "critical"},
            {"name": "Linux", "level": "advanced", "category": "cloud_devops", "weight": 1.2, "importance": "critical"},
            {"name": "AWS", "level": "advanced", "category": "cloud_devops", "weight": 1.0, "importance": "important"},
            {"name": "Terraform", "level": "intermediate", "category": "cloud_devops", "weight": 1.0, "importance": "important"},
            {"name": "Git", "level": "advanced", "category": "tools", "weight": 1.0, "importance": "important"},
            {"name": "Bash", "level": "advanced", "category": "cloud_devops", "weight": 1.0, "importance": "important"},
            {"name": "Python", "level": "intermediate", "category": "programming", "weight": 0.8, "importance": "supporting"},
            {"name": "Jenkins", "level": "intermediate", "category": "cloud_devops", "weight": 0.8, "importance": "supporting"},
        ]
    },
    "ml-engineer": {
        "label": "Machine Learning Engineer",
        "skills": [
            {"name": "Python", "level": "advanced", "category": "programming", "weight": 1.3, "importance": "critical"},
            {"name": "Machine Learning", "level": "advanced", "category": "data_ml", "weight": 1.3, "importance": "critical"},
            {"name": "Deep Learning", "level": "advanced", "category": "data_ml", "weight": 1.2, "importance": "critical"},
            {"name": "Scikit-learn", "level": "advanced", "category": "data_ml", "weight": 1.2, "importance": "critical"},
            {"name": "TensorFlow", "level": "advanced", "category": "data_ml", "weight": 1.0, "importance": "important"},
            {"name": "PyTorch", "level": "advanced", "category": "data_ml", "weight": 1.0, "importance": "important"},
            {"name": "Docker", "level": "intermediate", "category": "cloud_devops", "weight": 1.0, "importance": "important"},
            {"name": "MLOps", "level": "intermediate", "category": "data_ml", "weight": 1.0, "importance": "important"},
            {"name": "AWS", "level": "intermediate", "category": "cloud_devops", "weight": 0.8, "importance": "supporting"},
            {"name": "SQL", "level": "intermediate", "category": "database", "weight": 0.8, "importance": "supporting"},
        ]
    },
    "cloud-architect": {
        "label": "Cloud Architect",
        "skills": [
            {"name": "AWS", "level": "advanced", "category": "cloud_devops", "weight": 1.3, "importance": "critical"},
            {"name": "Kubernetes", "level": "advanced", "category": "cloud_devops", "weight": 1.3, "importance": "critical"},
            {"name": "Terraform", "level": "advanced", "category": "cloud_devops", "weight": 1.2, "importance": "critical"},
            {"name": "Security", "level": "advanced", "category": "cloud_devops", "weight": 1.2, "importance": "critical"},
            {"name": "Azure", "level": "advanced", "category": "cloud_devops", "weight": 1.0, "importance": "important"},
            {"name": "Docker", "level": "advanced", "category": "cloud_devops", "weight": 1.0, "importance": "important"},
            {"name": "Networking", "level": "advanced", "category": "cloud_devops", "weight": 1.0, "importance": "important"},
            {"name": "Microservices", "level": "advanced", "category": "tools", "weight": 1.0, "importance": "important"},
            {"name": "GCP", "level": "intermediate", "category": "cloud_devops", "weight": 0.8, "importance": "supporting"},
        ]
    },
    "product-manager": {
        "label": "Product Manager",
        "skills": [
            {"name": "Product Strategy", "level": "advanced", "category": "tools", "weight": 1.3, "importance": "critical"},
            {"name": "Agile", "level": "advanced", "category": "tools", "weight": 1.2, "importance": "critical"},
            {"name": "User Research", "level": "advanced", "category": "tools", "weight": 1.2, "importance": "critical"},
            {"name": "Scrum", "level": "advanced", "category": "tools", "weight": 1.0, "importance": "important"},
            {"name": "Data Analysis", "level": "intermediate", "category": "data_ml", "weight": 1.0, "importance": "important"},
            {"name": "Jira", "level": "intermediate", "category": "tools", "weight": 1.0, "importance": "important"},
            {"name": "A/B Testing", "level": "intermediate", "category": "tools", "weight": 0.8, "importance": "supporting"},
            {"name": "SQL", "level": "beginner", "category": "database", "weight": 0.8, "importance": "supporting"},
        ]
    },
    "ui-ux-designer": {
        "label": "UI/UX Designer",
        "skills": [
            {"name": "Figma", "level": "advanced", "category": "tools", "weight": 1.3, "importance": "critical"},
            {"name": "UI Design", "level": "advanced", "category": "frontend", "weight": 1.3, "importance": "critical"},
            {"name": "UX Research", "level": "advanced", "category": "tools", "weight": 1.2, "importance": "critical"},
            {"name": "Prototyping", "level": "advanced", "category": "tools", "weight": 1.0, "importance": "important"},
            {"name": "Design Systems", "level": "intermediate", "category": "tools", "weight": 1.0, "importance": "important"},
            {"name": "User Testing", "level": "intermediate", "category": "tools", "weight": 1.0, "importance": "important"},
            {"name": "CSS", "level": "intermediate", "category": "frontend", "weight": 0.8, "importance": "supporting"},
            {"name": "HTML", "level": "intermediate", "category": "frontend", "weight": 0.8, "importance": "supporting"},
            {"name": "Adobe XD", "level": "intermediate", "category": "tools", "weight": 0.8, "importance": "supporting"},
        ]
    },
    "business-analyst": {
        "label": "Business Analyst",
        "skills": [
            {"name": "Excel", "level": "advanced", "category": "tools", "weight": 1.3, "importance": "critical"},
            {"name": "SQL", "level": "advanced", "category": "database", "weight": 1.3, "importance": "critical"},
            {"name": "Data Analysis", "level": "advanced", "category": "data_ml", "weight": 1.3, "importance": "critical"},
            {"name": "Agile", "level": "intermediate", "category": "tools", "weight": 1.0, "importance": "important"},
            {"name": "Jira", "level": "intermediate", "category": "tools", "weight": 1.0, "importance": "important"},
            {"name": "Power BI", "level": "intermediate", "category": "tools", "weight": 0.8, "importance": "supporting"},
            {"name": "Tableau", "level": "intermediate", "category": "tools", "weight": 0.8, "importance": "supporting"},
        ]
    },
    "product-analyst": {
        "label": "Product Analyst",
        "skills": [
            {"name": "SQL", "level": "advanced", "category": "database", "weight": 1.3, "importance": "critical"},
            {"name": "Data Analysis", "level": "advanced", "category": "data_ml", "weight": 1.3, "importance": "critical"},
            {"name": "A/B Testing", "level": "advanced", "category": "tools", "weight": 1.2, "importance": "critical"},
            {"name": "Python", "level": "intermediate", "category": "programming", "weight": 1.0, "importance": "important"},
            {"name": "Statistics", "level": "intermediate", "category": "data_ml", "weight": 1.0, "importance": "important"},
            {"name": "Excel", "level": "advanced", "category": "tools", "weight": 1.0, "importance": "important"},
            {"name": "Tableau", "level": "intermediate", "category": "tools", "weight": 0.8, "importance": "supporting"},
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
