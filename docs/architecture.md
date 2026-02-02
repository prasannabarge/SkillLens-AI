# SkillLens – AI Career Skill Analyzer

## Architecture Overview

This document describes the architectural design of the SkillLens application.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React + Tailwind Frontend                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │  Upload  │  │  Analysis │  │  Roadmap │  │ Dashboard │  │   │
│  │  │   Page   │  │   Page   │  │   Page   │  │   Page   │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Node.js + Express Backend                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │   Auth   │  │ Analysis │  │  Roadmap │  │   User   │  │   │
│  │  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────┬────────────────────────────┬─────────────────────┘
               │ HTTP/REST                  │ MongoDB Driver
               ▼                            ▼
┌──────────────────────────┐   ┌──────────────────────────────────┐
│      NLP MICROSERVICE    │   │          DATA LAYER              │
├──────────────────────────┤   ├──────────────────────────────────┤
│  Python FastAPI          │   │  ┌──────────────────────────┐   │
│  ┌────────────────────┐  │   │  │      MongoDB Atlas       │   │
│  │  Resume Parser     │  │   │  │                          │   │
│  │  Skill Extractor   │  │   │  │  ┌────────┐  ┌────────┐  │   │
│  │  Skill Matcher     │  │   │  │  │ Users  │  │Analysis│  │   │
│  │  Job Role DB       │  │   │  │  └────────┘  └────────┘  │   │
│  └────────────────────┘  │   │  │  ┌────────┐              │   │
└──────────────────────────┘   │  │  │Roadmaps│              │   │
                               │  │  └────────┘              │   │
                               │  └──────────────────────────┘   │
                               └──────────────────────────────────┘
```

---

## Component Details

### 1. Frontend (React + Tailwind)

**Location:** `/frontend`

| Component | Description |
|-----------|-------------|
| Pages | HomePage, UploadPage, AnalysisPage, RoadmapPage, DashboardPage |
| Components | Navbar, Footer, Button, Card, Input, Loading |
| Hooks | useAuth, useAnalysis |
| Services | API client with axios |

**Key Features:**
- Responsive design with Tailwind CSS
- Dark mode gradient theme
- File upload with drag-and-drop
- Interactive skill visualization

---

### 2. Backend (Node.js + Express)

**Location:** `/backend`

| Module | Description |
|--------|-------------|
| Routes | auth, analysis, roadmap, user |
| Controllers | Business logic handlers |
| Models | User, Analysis, Roadmap (MongoDB) |
| Middleware | auth, upload, validators, errorHandler |
| Services | nlp.service, roadmap.service |

**Key Features:**
- JWT authentication
- File upload handling
- Rate limiting
- Error handling

---

### 3. NLP Microservice (Python FastAPI)

**Location:** `/nlp-service`

| Module | Description |
|--------|-------------|
| Parsers | PDF, DOCX, TXT resume parsing |
| NLP | Skill extraction, matching |
| Utils | Job role database |
| Routes | analyze, match, skills |

**Key Features:**
- Multi-format resume parsing
- Pattern-based skill extraction
- Fuzzy skill matching
- 10+ job role profiles

---

## Data Flow

### Resume Analysis Flow

```
1. User uploads resume + selects target role
                    │
                    ▼
2. Frontend sends to Backend /api/analysis/analyze
                    │
                    ▼
3. Backend validates & forwards to NLP Service
                    │
                    ▼
4. NLP Service:
   a. Parses resume (PDF/DOCX/TXT)
   b. Extracts skills using NLP
   c. Gets required skills for role
   d. Matches & identifies gaps
                    │
                    ▼
5. Backend saves Analysis to MongoDB
                    │
                    ▼
6. Frontend displays results with visualization
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Node.js 18, Express, Mongoose, JWT |
| NLP Service | Python 3.11, FastAPI, spaCy, pdfplumber |
| Database | MongoDB Atlas |
| DevOps | Docker, Docker Compose, GitHub Actions |
| Hosting | Vercel (FE), Render (BE, NLP) |

---

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Helmet security headers
- Rate limiting
- Input validation
- CORS configuration

---

## Deployment Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Vercel      │────▶│     Render      │────▶│  MongoDB Atlas  │
│   (Frontend)    │     │ (Backend + NLP) │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```
