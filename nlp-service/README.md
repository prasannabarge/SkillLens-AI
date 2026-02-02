# SkillLens NLP Service

Python FastAPI microservice for resume parsing and skill extraction.

## Tech Stack

- **FastAPI** - Web framework
- **spaCy** - NLP processing
- **pdfplumber** - PDF parsing
- **python-docx** - DOCX parsing
- **sentence-transformers** - Semantic similarity

## Getting Started

### Prerequisites

- Python 3.10+
- pip or pipenv

### Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Start server
python main.py
# Or with uvicorn directly:
uvicorn main:app --reload --port 8000
```

## Project Structure

```
nlp-service/
├── app/
│   ├── nlp/             # NLP processing modules
│   │   ├── skill_extractor.py
│   │   └── skill_matcher.py
│   ├── parsers/         # Document parsers
│   │   └── resume_parser.py
│   ├── routes/          # API routes
│   │   ├── analysis.py
│   │   ├── skills.py
│   │   └── health.py
│   ├── utils/           # Utilities
│   │   └── job_roles.py
│   └── config.py        # Configuration
├── main.py              # Entry point
├── requirements.txt     # Dependencies
└── README.md
```

## API Endpoints

### Health
- `GET /health` - Health check
- `GET /` - Service info

### Analysis
- `POST /api/analyze` - Analyze resume
- `POST /api/match` - Match skills

### Skills
- `GET /api/skills/{role_id}` - Get skills for role
- `GET /api/roles` - List all roles

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

Create a `.env` file:

```env
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
DEBUG=true
```

## Supported File Formats

- PDF (.pdf)
- Microsoft Word (.docx)
- Plain Text (.txt)
