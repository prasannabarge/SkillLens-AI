# SkillLens API Specification

## Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:5000/api` |
| Production | `https://api.skilllens.app/api` |

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64abc123def456",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64abc123def456",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "64abc123def456",
    "name": "John Doe",
    "email": "john@example.com",
    "analyses": [...],
    "savedRoadmaps": [...]
  }
}
```

---

### Resume Analysis

#### Analyze Resume
```http
POST /analysis/analyze
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:**
- `resume`: File (PDF, DOCX, TXT)
- `targetRole`: String (e.g., "frontend-developer")

**Response:** `201 Created`
```json
{
  "success": true,
  "analysis": {
    "_id": "64xyz789abc123",
    "user": "64abc123def456",
    "resumeFileName": "john_doe_resume.pdf",
    "targetRole": "frontend-developer",
    "extractedSkills": [
      { "name": "JavaScript", "level": "advanced", "confidence": 0.95 },
      { "name": "React", "level": "intermediate", "confidence": 0.85 }
    ],
    "requiredSkills": [
      { "name": "JavaScript", "level": "advanced" },
      { "name": "TypeScript", "level": "intermediate" }
    ],
    "matchedSkills": [
      { "name": "JavaScript" },
      { "name": "React" }
    ],
    "gapSkills": [
      { "name": "TypeScript", "level": "beginner" }
    ],
    "overallMatchScore": 75.5,
    "recommendations": [
      {
        "skill": "TypeScript",
        "priority": "high",
        "reason": "TypeScript is a core requirement for this role"
      }
    ],
    "status": "completed",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### Get Analysis History
```http
GET /analysis/history
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "analyses": [...]
}
```

---

#### Get Single Analysis
```http
GET /analysis/:id
Authorization: Bearer <token>
```

---

#### Delete Analysis
```http
DELETE /analysis/:id
Authorization: Bearer <token>
```

---

### Learning Roadmap

#### Generate Roadmap
```http
POST /roadmap/generate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "analysisId": "64xyz789abc123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "roadmap": {
    "_id": "64roadmap123",
    "user": "64abc123def456",
    "analysis": "64xyz789abc123",
    "targetRole": "frontend-developer",
    "phases": [
      {
        "name": "Phase 1: Foundation",
        "description": "Build a strong foundation with essential skills",
        "order": 1,
        "milestones": [
          {
            "title": "Learn TypeScript",
            "description": "Master TypeScript fundamentals",
            "skills": ["TypeScript"],
            "resources": [
              {
                "title": "TypeScript Handbook",
                "type": "tutorial",
                "url": "https://typescriptlang.org/docs"
              }
            ],
            "estimatedTime": "2 weeks",
            "isCompleted": false
          }
        ],
        "estimatedDuration": "3 weeks"
      }
    ],
    "totalEstimatedTime": "6 weeks",
    "progress": 0
  }
}
```

---

#### Get Saved Roadmaps
```http
GET /roadmap/saved
Authorization: Bearer <token>
```

---

#### Save Roadmap
```http
POST /roadmap/:id/save
Authorization: Bearer <token>
```

---

#### Update Progress
```http
PUT /roadmap/:id/progress
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "phaseIndex": 0,
  "milestoneIndex": 0,
  "isCompleted": true
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message here",
  "details": [...] // Optional validation errors
}
```

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Available Job Roles

| ID | Label |
|----|-------|
| frontend-developer | Frontend Developer |
| backend-developer | Backend Developer |
| fullstack-developer | Full Stack Developer |
| data-scientist | Data Scientist |
| data-analyst | Data Analyst |
| devops-engineer | DevOps Engineer |
| ml-engineer | Machine Learning Engineer |
| cloud-architect | Cloud Architect |
| product-manager | Product Manager |
| ui-ux-designer | UI/UX Designer |
