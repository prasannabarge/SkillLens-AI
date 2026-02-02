# Software Requirements Specification (SRS)
## SkillLens – AI Career Skill Analyzer

**Version:** 1.0  
**Date:** January 2026

---

## 1. Introduction

### 1.1 Purpose
SkillLens is an AI-powered web application that helps job seekers identify skill gaps between their current skillset and the requirements of their target job roles, then generates personalized learning roadmaps to bridge those gaps.

### 1.2 Scope
The system will:
- Parse and analyze resumes in multiple formats (PDF, DOCX, TXT)
- Extract skills using Natural Language Processing (NLP)
- Compare extracted skills against job role requirements
- Visualize skill gaps
- Generate personalized learning roadmaps
- Track learning progress

### 1.3 Target Audience
- Job seekers looking to transition into new roles
- Career changers
- Students entering the job market
- Professionals seeking skill development guidance

---

## 2. Functional Requirements

### 2.1 User Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1.1 | Users shall be able to register with email and password | High |
| FR-1.2 | Users shall be able to login with credentials | High |
| FR-1.3 | Users shall be able to view and update their profile | Medium |
| FR-1.4 | Users shall be able to delete their account | Low |
| FR-1.5 | Password must meet minimum security requirements | High |

### 2.2 Resume Upload & Analysis

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-2.1 | System shall accept PDF, DOCX, and TXT file formats | High |
| FR-2.2 | Maximum file size shall be 5MB | Medium |
| FR-2.3 | System shall extract text from uploaded resumes | High |
| FR-2.4 | System shall extract skills from resume text using NLP | High |
| FR-2.5 | Users shall be able to select a target job role | High |
| FR-2.6 | System shall store analysis history for each user | Medium |

### 2.3 Skill Gap Analysis

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.1 | System shall compare user skills against role requirements | High |
| FR-3.2 | System shall identify matched and missing skills | High |
| FR-3.3 | System shall calculate an overall match score (0-100%) | High |
| FR-3.4 | System shall prioritize skill gaps by importance | Medium |
| FR-3.5 | System shall display visual skill comparison | Medium |

### 2.4 Learning Roadmap

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-4.1 | System shall generate personalized learning roadmaps | High |
| FR-4.2 | Roadmaps shall be organized into phases | Medium |
| FR-4.3 | Each phase shall contain milestones with resources | Medium |
| FR-4.4 | Users shall be able to save roadmaps | Medium |
| FR-4.5 | Users shall be able to track progress on roadmaps | Medium |
| FR-4.6 | System shall estimate time to complete roadmap | Low |

### 2.5 Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.1 | Dashboard shall display analysis statistics | Medium |
| FR-5.2 | Dashboard shall show recent analyses | Medium |
| FR-5.3 | Dashboard shall display saved roadmaps | Medium |
| FR-5.4 | Dashboard shall show overall progress | Low |

---

## 3. Non-Functional Requirements

### 3.1 Performance

| ID | Requirement | Metric |
|----|-------------|--------|
| NFR-1.1 | Page load time | < 2 seconds |
| NFR-1.2 | Resume analysis time | < 30 seconds |
| NFR-1.3 | API response time | < 500ms |
| NFR-1.4 | Concurrent users | 100+ |

### 3.2 Security

| ID | Requirement |
|----|-------------|
| NFR-2.1 | All passwords must be hashed using bcrypt |
| NFR-2.2 | All API endpoints must use HTTPS |
| NFR-2.3 | JWT tokens must expire after 7 days |
| NFR-2.4 | Rate limiting must prevent brute force attacks |
| NFR-2.5 | User data must be stored securely |

### 3.3 Usability

| ID | Requirement |
|----|-------------|
| NFR-3.1 | Application must be responsive (mobile, tablet, desktop) |
| NFR-3.2 | UI must follow accessibility guidelines (WCAG 2.1) |
| NFR-3.3 | Error messages must be user-friendly |
| NFR-3.4 | File upload must support drag-and-drop |

### 3.4 Reliability

| ID | Requirement | Metric |
|----|-------------|--------|
| NFR-4.1 | System uptime | 99.5% |
| NFR-4.2 | Data backup frequency | Daily |
| NFR-4.3 | Error recovery | Automatic restart |

### 3.5 Scalability

| ID | Requirement |
|----|-------------|
| NFR-5.1 | System must support horizontal scaling |
| NFR-5.2 | Database must support sharding |
| NFR-5.3 | Microservices must be independently scalable |

---

## 4. System Constraints

### 4.1 Technical Constraints
- Frontend: React 18+, Tailwind CSS
- Backend: Node.js 18+, Express
- NLP Service: Python 3.10+, FastAPI
- Database: MongoDB 7.0+
- Docker for containerization

### 4.2 Business Constraints
- Initial release limited to 10 job roles
- Free tier limited to 5 analyses per month
- Learning resources are external links only

---

## 5. Use Cases

### 5.1 Analyze Resume

**Actor:** Registered User  
**Precondition:** User is logged in  
**Main Flow:**
1. User navigates to Upload page
2. User uploads resume file
3. User selects target job role
4. User clicks "Analyze"
5. System processes resume and extracts skills
6. System compares with role requirements
7. System displays analysis results

**Postcondition:** Analysis saved to user's history

---

### 5.2 Generate Roadmap

**Actor:** Registered User  
**Precondition:** User has completed analysis  
**Main Flow:**
1. User views analysis results
2. User clicks "Generate Roadmap"
3. System creates personalized learning path
4. System displays roadmap with phases
5. User can save roadmap

**Postcondition:** Roadmap available in dashboard

---

## 6. Glossary

| Term | Definition |
|------|------------|
| Skill Gap | The difference between current skills and required skills |
| NLP | Natural Language Processing |
| Roadmap | Structured learning path to acquire skills |
| JWT | JSON Web Token for authentication |
| Analysis | Result of processing a resume for a specific role |
