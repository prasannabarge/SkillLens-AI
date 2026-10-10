"""
Test FastAPI API Endpoints for SkillLens NLP Service
Tests /api/analyze and /api/match endpoints
"""

import io
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] in ("ok", "healthy")



def test_api_match_endpoint():
    payload = {
        "userSkills": ["HTML5", "CSS3", "JS", "React.js"],
        "requiredSkills": ["HTML", "CSS", "JavaScript", "React", "TypeScript"]
    }
    response = client.post("/api/match", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "HTML" in data["matched"]
    assert "CSS" in data["matched"]
    assert "JavaScript" in data["matched"]
    assert "React" in data["matched"]
    assert "TypeScript" in data["gaps"]
    assert data["score"] == 80.0


def test_api_analyze_txt_resume_endpoint():
    resume_content = b"""
    JANE DEVELOPER
    SKILLS
    HTML5, CSS3, JavaScript, React, Git, REST APIs
    """
    file_tuple = ("resume.txt", io.BytesIO(resume_content), "text/plain")

    response = client.post(
        "/api/analyze",
        data={"target_role": "frontend-developer"},
        files={"file": file_tuple}
    )
    assert response.status_code == 200
    data = response.json()

    matched_names = [s["name"] for s in data["matched_skills"]]
    gap_names = [s["name"] for s in data["gap_skills"]]

    # HTML, CSS, JavaScript, React, Git, REST API MUST ALL BE MATCHED
    assert "HTML" in matched_names
    assert "CSS" in matched_names
    assert "JavaScript" in matched_names
    assert "React" in matched_names
    assert "Git" in matched_names
    assert "REST API" in matched_names

    # HTML MUST NOT BE IN GAPS
    assert "HTML" not in gap_names
    assert "CSS" not in gap_names
    assert "JavaScript" not in gap_names

    # Check evidence is present on matched skills
    html_skill = next(s for s in data["matched_skills"] if s["name"] == "HTML")
    assert html_skill["status"] == "present"
    assert html_skill["canonical_name"] == "HTML"
    assert len(html_skill["evidence"]) > 0


def test_api_analyze_pdf_bytes_handling():
    # Test that empty or broken files return appropriate status codes
    response = client.post(
        "/api/analyze",
        data={"target_role": "frontend-developer"},
        files={"file": ("empty.txt", io.BytesIO(b""), "text/plain")}
    )
    assert response.status_code == 400
