# SkillLens Backend

Node.js + Express API server for the SkillLens AI Career Skill Analyzer.

## Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **JWT** - Authentication
- **Multer** - File uploads
- **Helmet** - Security headers
- **Morgan** - Request logging

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- NLP Service running on port 8000

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your values

# Start development server
npm run dev

# Start production server
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── .env.example         # Environment template
├── package.json         # Dependencies
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Analysis
- `POST /api/analysis/analyze` - Analyze resume
- `GET /api/analysis/history` - Get analysis history
- `GET /api/analysis/:id` - Get single analysis
- `DELETE /api/analysis/:id` - Delete analysis

### Roadmap
- `POST /api/roadmap/generate` - Generate roadmap
- `GET /api/roadmap/saved` - Get saved roadmaps
- `GET /api/roadmap/:id` - Get single roadmap
- `POST /api/roadmap/:id/save` - Save roadmap
- `PUT /api/roadmap/:id/progress` - Update progress
- `DELETE /api/roadmap/:id` - Delete roadmap

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user
- `DELETE /api/users/me` - Delete account

## Environment Variables

See `.env.example` for all available variables.

## Scripts

- `npm run dev` - Start with nodemon
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
