"""
Automated Test Suite for SkillLens Skill Extraction & Matching Pipeline
Tests 14 mandatory core cases, 10 diverse resume types, and boundary edge cases.
"""

import pytest
from app.nlp.taxonomy import taxonomy
from app.nlp.skill_extractor import SkillExtractor
from app.nlp.skill_matcher import SkillMatcher
from app.utils.job_roles import get_required_skills


@pytest.fixture(scope="module")
def extractor():
    return SkillExtractor()


@pytest.fixture(scope="module")
def matcher():
    return SkillMatcher()


# ============================================================================
# 1. THE 14 MANDATORY CORE TEST CASES
# ============================================================================

def test_1_html_exact(extractor, matcher):
    """Test 1: Resume: HTML, Required: HTML -> PRESENT"""
    resume = "Technical Skills: HTML"
    extracted = extractor.extract_skills(resume)
    result = matcher.match_skills(extracted, ["HTML"], resume_text=resume)
    assert "HTML" in result["matched"]
    assert "HTML" not in result["gaps"]
    assert result["details"]["HTML"]["status"] == "present"


def test_2_html5_alias(extractor, matcher):
    """Test 2: Resume: HTML5, Required: HTML -> PRESENT"""
    resume = "Skills: HTML5"
    extracted = extractor.extract_skills(resume)
    result = matcher.match_skills(extracted, ["HTML"], resume_text=resume)
    assert "HTML" in result["matched"]
    assert "HTML" not in result["gaps"]
    assert result["details"]["HTML"]["status"] == "present"


def test_3_css3_alias(extractor, matcher):
    """Test 3: Resume: CSS3, Required: CSS -> PRESENT"""
    resume = "Core Skills: CSS3"
    extracted = extractor.extract_skills(resume)
    result = matcher.match_skills(extracted, ["CSS"], resume_text=resume)
    assert "CSS" in result["matched"]
    assert "CSS" not in result["gaps"]
    assert result["details"]["CSS"]["status"] == "present"


def test_4_js_alias(extractor, matcher):
    """Test 4: Resume: JS, Required: JavaScript -> PRESENT"""
    resume = "Frontend stack: JS, React"
    extracted = extractor.extract_skills(resume)
    result = matcher.match_skills(extracted, ["JavaScript"], resume_text=resume)
    assert "JavaScript" in result["matched"]
    assert "JavaScript" not in result["gaps"]
    assert result["details"]["JavaScript"]["status"] == "present"


def test_5_react_js_alias(extractor, matcher):
    """Test 5: Resume: React.js, Required: React -> PRESENT"""
    resume = "Frameworks: React.js"
    extracted = extractor.extract_skills(resume)
    result = matcher.match_skills(extracted, ["React"], resume_text=resume)
    assert "React" in result["matched"]
    assert "React" not in result["gaps"]
    assert result["details"]["React"]["status"] == "present"


def test_6_node_js_alias(extractor, matcher):
    """Test 6: Resume: Node.js, Required: Node -> PRESENT"""
    resume = "Backend: Node.js"
    extracted = extractor.extract_skills(resume)
    result = matcher.match_skills(extracted, ["Node"], resume_text=resume)
    assert "Node" in result["matched"]
    assert "Node" not in result["gaps"]
    assert result["details"]["Node"]["status"] == "present"


def test_7_contextual_html_css(extractor, matcher):
    """Test 7: Resume: 'Built responsive websites using HTML and CSS.', Required: HTML, CSS -> Both PRESENT"""
    resume = "Experience: Built responsive websites using HTML and CSS."
    extracted = extractor.extract_skills(resume)
    result = matcher.match_skills(extracted, ["HTML", "CSS"], resume_text=resume)
    assert "HTML" in result["matched"]
    assert "CSS" in result["matched"]
    assert len(result["gaps"]) == 0
    assert result["details"]["HTML"]["status"] == "present"
    assert result["details"]["CSS"]["status"] == "present"


def test_8_contextual_react_javascript(extractor, matcher):
    """Test 8: Resume: 'Developed React applications using JavaScript.', Required: React, JavaScript -> Both PRESENT"""
    resume = "Projects: Developed React applications using JavaScript."
    extracted = extractor.extract_skills(resume)
    result = matcher.match_skills(extracted, ["React", "JavaScript"], resume_text=resume)
    assert "React" in result["matched"]
    assert "JavaScript" in result["matched"]
    assert len(result["gaps"]) == 0


def test_9_java_is_not_javascript(extractor, matcher):
    """Test 9: Resume: Java, Required: JavaScript -> MISSING (No false positive substring match)"""
    resume = "Experience: Senior Java developer building enterprise services."
    extracted = extractor.extract_skills(resume)
    result = matcher.match_skills(extracted, ["JavaScript"], resume_text=resume)
    assert "JavaScript" in result["gaps"]
    assert "JavaScript" not in result["matched"]
    assert result["details"]["JavaScript"]["status"] == "missing"


def test_10_python_plus_django(extractor, matcher):
    """Test 10: Resume: Python + Django, Required: Python -> PRESENT"""
    resume = "Technologies: Python + Django"
    extracted = extractor.extract_skills(resume)
    result = matcher.match_skills(extracted, ["Python"], resume_text=resume)
    assert "Python" in result["matched"]
    assert "Python" not in result["gaps"]
    assert result["details"]["Python"]["status"] == "present"


def test_11_django_alone_does_not_infer_python(extractor, matcher):
    """Test 11: Resume: Django, Required: Python -> MISSING (No blind inference without Python evidence)"""
    resume = "Technologies: Django framework used for web dashboard."
    extracted = extractor.extract_skills(resume)
    result = matcher.match_skills(extracted, ["Python"], resume_text=resume)
    assert "Python" in result["gaps"]
    assert "Python" not in result["matched"]


def test_12_restful_apis_node(extractor, matcher):
    """Test 12: Resume: 'Experience: Built RESTful APIs using Node.js.', Required: REST APIs, Node.js -> Both PRESENT"""
    resume = "Experience: Built RESTful APIs using Node.js."
    extracted = extractor.extract_skills(resume)
    result = matcher.match_skills(extracted, ["REST APIs", "Node.js"], resume_text=resume)
    assert "REST APIs" in result["matched"]
    assert "Node.js" in result["matched"]
    assert len(result["gaps"]) == 0


def test_13_microsoft_excel(extractor, matcher):
    """Test 13: Resume: 'Microsoft Excel', Required: Excel -> PRESENT"""
    resume = "Tools: Microsoft Excel"
    extracted = extractor.extract_skills(resume)
    result = matcher.match_skills(extracted, ["Excel"], resume_text=resume)
    assert "Excel" in result["matched"]
    assert "Excel" not in result["gaps"]
    assert result["details"]["Excel"]["status"] == "present"


def test_14_power_bi(extractor, matcher):
    """Test 14: Resume: 'Power BI', Required: Microsoft Power BI -> PRESENT"""
    resume = "BI Tools: Power BI"
    extracted = extractor.extract_skills(resume)
    result = matcher.match_skills(extracted, ["Microsoft Power BI"], resume_text=resume)
    assert "Microsoft Power BI" in result["matched"]
    assert "Microsoft Power BI" not in result["gaps"]


# ============================================================================
# 2. THE 10 RESUME TYPES TESTS
# ============================================================================

def test_resume_type_1_frontend_developer(extractor, matcher):
    """1. Frontend Developer Resume"""
    resume = """
    ALEX RIVERA - Frontend Engineer
    alex@example.com | San Francisco, CA

    SUMMARY
    Frontend engineer with 4+ years of experience building scalable web applications.

    SKILLS
    • Languages: HTML5, CSS3, JavaScript (ES6+), TypeScript
    • Frameworks & Libraries: React.js, Next.js, Redux, Tailwind CSS
    • Tools & Practices: Git, Webpack, Jest, REST APIs

    EXPERIENCE
    Frontend Developer | Acme Corp | 2021 - Present
    - Developed component library using React, TypeScript and Tailwind CSS.
    - Improved page performance and accessibility across modern browsers.
    """
    extracted = extractor.extract_skills(resume)
    role_reqs = get_required_skills("frontend-developer")
    result = matcher.match_skills(extracted, role_reqs, resume_text=resume)

    # Core frontend skills must ALL be present
    for skill in ["JavaScript", "HTML", "CSS", "React", "TypeScript", "Git", "REST API", "Tailwind", "Redux", "Jest"]:
        assert skill in result["matched"], f"Expected {skill} to be matched in Frontend resume"
    assert len(result["gaps"]) == 0
    assert result["score"] == 100.0


def test_resume_type_2_backend_developer(extractor, matcher):
    """2. Backend Developer Resume"""
    resume = """
    SARAH CHEN - Backend Engineer
    TECHNICAL SKILLS
    Languages: Python 3, JavaScript
    Backend: Node.js, Express.js
    Databases: PostgreSQL, MongoDB, SQL
    Infrastructure: Docker, REST APIs, Git
    """
    extracted = extractor.extract_skills(resume)
    role_reqs = get_required_skills("backend-developer")
    result = matcher.match_skills(extracted, role_reqs, resume_text=resume)

    for skill in ["Node.js", "JavaScript", "Python", "SQL", "MongoDB", "REST API", "Git", "Docker", "Express", "PostgreSQL"]:
        assert skill in result["matched"], f"Expected {skill} to be matched in Backend resume"
    assert len(result["gaps"]) == 0


def test_resume_type_3_fullstack_developer(extractor, matcher):
    """3. Full Stack Developer Resume"""
    resume = """
    MARCUS VANCE - Full Stack Web Developer
    SKILLS
    HTML/CSS, JavaScript, React, Node.js, MongoDB, SQL, Git, Docker, RESTful APIs, TypeScript
    """
    extracted = extractor.extract_skills(resume)
    role_reqs = get_required_skills("fullstack-developer")
    result = matcher.match_skills(extracted, role_reqs, resume_text=resume)

    for skill in ["JavaScript", "React", "Node.js", "HTML", "CSS", "MongoDB", "SQL", "Git", "Docker", "REST API", "TypeScript"]:
        assert skill in result["matched"], f"Expected {skill} to be matched in Full Stack resume"


def test_resume_type_4_data_analyst(extractor, matcher):
    """4. Data Analyst Resume"""
    resume = """
    ELENA ROSTOVA - Data Analyst
    SKILLS & TOOLS
    • SQL (PostgreSQL, MySQL)
    • Microsoft Excel (Pivot tables, VLOOKUP, Modeling)
    • Python (Pandas, NumPy)
    • Data Visualization: Tableau, Power BI
    • Statistics & Exploratory Data Analysis
    """
    extracted = extractor.extract_skills(resume)
    role_reqs = get_required_skills("data-analyst")
    result = matcher.match_skills(extracted, role_reqs, resume_text=resume)

    for skill in ["SQL", "Excel", "Python", "Pandas", "Data Visualization", "Tableau", "Statistics", "Power BI"]:
        assert skill in result["matched"], f"Expected {skill} to be matched in Data Analyst resume"


def test_resume_type_5_business_analyst(extractor, matcher):
    """5. Business Analyst Resume"""
    resume = """
    PRIYA SHARMA - Business Analyst
    EXPERIENCE
    - Conducted business requirements gathering and data analysis.
    - Built operational dashboards in Microsoft Power BI and Tableau.
    - Wrote complex SQL queries to analyze customer retention.
    - Advanced MS Excel financial modeling.
    - Worked in Agile sprint ceremonies using Jira.
    """
    extracted = extractor.extract_skills(resume)
    role_reqs = get_required_skills("business-analyst")
    result = matcher.match_skills(extracted, role_reqs, resume_text=resume)

    for skill in ["Excel", "SQL", "Power BI", "Tableau", "Data Analysis", "Agile", "Jira"]:
        assert skill in result["matched"], f"Expected {skill} to be matched in Business Analyst resume"


def test_resume_type_6_product_analyst(extractor, matcher):
    """6. Product Analyst Resume"""
    resume = """
    DAVID KIM - Product Analyst
    SKILLS
    SQL, Python, A/B Testing, Statistics, Excel, Tableau, Data Analysis
    """
    extracted = extractor.extract_skills(resume)
    role_reqs = get_required_skills("product-analyst")
    result = matcher.match_skills(extracted, role_reqs, resume_text=resume)

    for skill in ["SQL", "A/B Testing", "Python", "Data Analysis", "Statistics", "Excel", "Tableau"]:
        assert skill in result["matched"], f"Expected {skill} to be matched in Product Analyst resume"


def test_resume_type_7_machine_learning(extractor, matcher):
    """7. Machine Learning Resume"""
    resume = """
    DR. A. GUPTA - Machine Learning Engineer
    TECHNICAL PROFICIENCIES
    Programming: Python, SQL
    Machine Learning: TensorFlow, PyTorch, Deep Learning, Scikit-learn
    DevOps: Docker, AWS, MLOps
    """
    extracted = extractor.extract_skills(resume)
    role_reqs = get_required_skills("ml-engineer")
    result = matcher.match_skills(extracted, role_reqs, resume_text=resume)

    for skill in ["Python", "Machine Learning", "TensorFlow", "PyTorch", "Deep Learning", "Docker", "AWS", "Scikit-learn", "MLOps", "SQL"]:
        assert skill in result["matched"], f"Expected {skill} to be matched in ML resume"


def test_resume_type_8_fresher(extractor, matcher):
    """8. Fresher Resume"""
    resume = """
    ANIKET PATIL - Computer Science Graduate (2024)
    EDUCATION
    B.Tech in Computer Science
    
    ACADEMIC PROJECTS
    College Portal:
    - Designed user interface using HTML5, CSS3, and JavaScript.
    - Created React components for student registration.
    - Managed source code on Git.
    """
    extracted = extractor.extract_skills(resume)
    result = matcher.match_skills(extracted, ["HTML", "CSS", "JavaScript", "React", "Git"], resume_text=resume)

    assert "HTML" in result["matched"]
    assert "CSS" in result["matched"]
    assert "JavaScript" in result["matched"]
    assert "React" in result["matched"]
    assert "Git" in result["matched"]
    assert len(result["gaps"]) == 0


def test_resume_type_9_skills_section_only(extractor, matcher):
    """9. Resume with only a Skills section"""
    resume = """
    SKILLS
    HTML, CSS, JavaScript, React, Git, REST API
    """
    extracted = extractor.extract_skills(resume)
    result = matcher.match_skills(extracted, ["HTML", "CSS", "JavaScript", "React", "Git", "REST API"], resume_text=resume)

    assert "HTML" in result["matched"]
    assert "CSS" in result["matched"]
    assert "JavaScript" in result["matched"]
    assert "React" in result["matched"]
    assert "Git" in result["matched"]
    assert "REST API" in result["matched"]


def test_resume_type_10_skills_inside_experience_projects_only(extractor, matcher):
    """10. Resume where skills appear ONLY inside projects/experience (No Skills Section)"""
    resume = """
    JANE SMITH - Web Consultant
    WORK EXPERIENCE
    Web Consultant | Digital Agency (2020 - 2023)
    - Created accessible client sites utilizing HTML and CSS stylesheets.
    - Built interactive browser scripts with JavaScript and modern React libraries.
    - Maintained code repositories using Git version control.
    - Integrated third-party REST APIs for e-commerce checkout.
    """
    extracted = extractor.extract_skills(resume)
    result = matcher.match_skills(extracted, ["HTML", "CSS", "JavaScript", "React", "Git", "REST API"], resume_text=resume)

    assert "HTML" in result["matched"]
    assert "CSS" in result["matched"]
    assert "JavaScript" in result["matched"]
    assert "React" in result["matched"]
    assert "Git" in result["matched"]
    assert "REST API" in result["matched"]
    assert len(result["gaps"]) == 0


# ============================================================================
# 3. BOUNDARY AND EDGE CASES
# ============================================================================

def test_git_vs_github(extractor, matcher):
    """Git and GitHub must remain distinct skills."""
    # Only GitHub mentioned
    resume_github = "Experience: Hosted project repositories on GitHub."
    ext_gh = extractor.extract_skills(resume_github)
    res_gh = matcher.match_skills(ext_gh, ["Git", "GitHub"], resume_text=resume_github)
    assert "GitHub" in res_gh["matched"]
    assert "Git" in res_gh["gaps"]

    # Both mentioned
    resume_both = "Skills: Proficient in Git and GitHub workflow."
    ext_both = extractor.extract_skills(resume_both)
    res_both = matcher.match_skills(ext_both, ["Git", "GitHub"], resume_text=resume_both)
    assert "Git" in res_both["matched"]
    assert "GitHub" in res_both["matched"]


def test_c_plus_plus_and_c_sharp(extractor, matcher):
    """C++, C#, and .NET boundary matching."""
    resume = "Technical Skills: C++, C#, and .NET"
    ext = extractor.extract_skills(resume)
    res = matcher.match_skills(ext, ["C++", "C#", ".NET"], resume_text=resume)
    assert "C++" in res["matched"]
    assert "C#" in res["matched"]
    assert ".NET" in res["matched"]


def test_evidence_presence(extractor, matcher):
    """Ensure explainable evidence is populated for matched skills."""
    resume = "Experience: Built responsive websites using HTML and CSS."
    ext = extractor.extract_skills(resume)
    res = matcher.match_skills(ext, ["HTML", "CSS"], resume_text=resume)

    assert len(res["details"]["HTML"]["evidence"]) > 0
    assert "HTML" in res["details"]["HTML"]["evidence"][0]
    assert len(res["details"]["CSS"]["evidence"]) > 0
    assert "CSS" in res["details"]["CSS"]["evidence"][0]
