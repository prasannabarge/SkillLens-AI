# SkillLens – AI Career Skill Analyzer

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-18%2B-green.svg)
![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg)
![React](https://img.shields.io/badge/react-18%2B-61DAFB.svg)

> AI-powered career skill analyzer that identifies skill gaps and generates personalized learning roadmaps.

## 🚀 Features

- 📄 **Resume Parsing** – Upload PDF, DOCX, or TXT resumes
- 🔍 **AI Skill Extraction** – NLP-powered skill detection
- 📊 **Gap Analysis** – Compare skills against job requirements
- 🗺️ **Learning Roadmaps** – Personalized learning paths
- 📈 **Progress Tracking** – Track your skill development
- 🔐 **Secure Auth** – JWT-based authentication

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React     │────▶│   Node.js   │────▶│   MongoDB   │
│  Frontend   │     │   Backend   │     │   Atlas     │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │   Python    │
                   │ NLP Service │
                   └─────────────┘
```

## 📁 Project Structure

```
SkillLens/
├── frontend/          # React + Tailwind frontend
├── backend/           # Node.js + Express API
├── nlp-service/       # Python FastAPI NLP microservice
├── infra/             # Docker & infrastructure
│   ├── docker-compose.yml
│   └── docker/
└── docs/              # Documentation
    ├── architecture.md
    ├── api-spec.md
    └── srs.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas)
- Docker (optional)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/skilllens.git
cd skilllens

# Start all services
cd infra
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# NLP API:  http://localhost:8000
```

### Option 2: Manual Setup

**1. Frontend**
```bash
cd frontend
npm install
npm run dev
```

**2. Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npm run dev
```

**3. NLP Service**
```bash
cd nlp-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python main.py
```

## 📖 Documentation

- [Architecture Overview](docs/architecture.md)
- [API Specification](docs/api-spec.md)
- [Software Requirements](docs/srs.md)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express, Mongoose, JWT |
| NLP | Python, FastAPI, spaCy, pdfplumber |
| Database | MongoDB Local |
| DevOps | Docker, Docker Compose, GitHub Actions |

## 🎯 Supported Job Roles

- Frontend Developer
- Backend Developer
- Full Stack Developer
- Data Scientist
- Data Analyst
- DevOps Engineer
- ML Engineer
- Cloud Architect
- Product Manager
- UI/UX Designer

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📧 Contact

For questions or support, please open an issue or contact the maintainers.

---

Made with ❤️ by the Prasanna Barge
