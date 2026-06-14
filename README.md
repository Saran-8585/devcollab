# DevCollab — Smart Developer Collaboration Platform

A GitHub-inspired developer collaboration platform with AI-powered code assistance, built with React, Node.js, Express, SQLite, and Ollama.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Recharts
- **Backend:** Node.js, Express.js (REST API)
- **Database:** SQLite via better-sqlite3
- **Auth:** JWT (localStorage)
- **AI Core:** Ollama (Gemma4)
- **Code Highlighting:** react-syntax-highlighter
- **Icons:** Lucide React

## Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9
- Ollama running locally with Gemma4 model

### 1. Install & Seed Database

```bash
# Install server dependencies
cd server
npm install

# Seed the database with sample data
npm run seed
```

### 2. Start the Server

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Start the Client

```bash
# In a new terminal
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

### 4. Open the App

Navigate to **http://localhost:5173**

## Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@devcollab.com | admin123 |
| Dev 1 | dev1@devcollab.com | dev123 |
| Dev 2 | dev2@devcollab.com | dev123 |
| Dev 3-15 | dev3@devcollab.com – dev15@devcollab.com | dev123 |

## Environment Variables

### Server (.env)
```
PORT=5000
JWT_SECRET=devcollab-super-secret-key-2024
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Features

- **Authentication** — Register/Login with JWT
- **Explore Page** — Featured projects, trending snippets, top developers
- **Developer Profiles** — Activity heatmap, language stats, pinned projects
- **Project Management** — Kanban tasks, code snippets, PRs, discussions
- **Code Snippets** — Post, share, and discover code with AI explanations
- **Pull Requests** — Two-panel diff viewer, AI code reviews, human reviews
- **AI Code Assistant** — Explain code, fix bugs, generate code, review code (Ollama)
- **Developer Dashboard** — Activity tracking, task management, project overview
- **Global Discussions** — Cross-project threaded discussions
- **Admin Dashboard** — User management, content moderation, platform stats

## Project Structure

```
devcollab/
├── client/                    # React frontend
│   └── src/
│       ├── components/        # UI components + Layout/Navbar
│       ├── context/           # Auth context
│       ├── hooks/             # Custom hooks
│       ├── pages/             # All route pages
│       └── utils/             # Constants, helpers
├── server/                    # Express backend
│   ├── ai/                    # Ollama AI integration
│   ├── controllers/           # Route handlers
│   ├── db/                    # SQLite database + seed
│   ├── middleware/            # Auth middleware
│   ├── routes/                # Express routes
│   └── utils/                 # Error handling, activity logger
└── README.md
```

## API Routes

| Group | Endpoints |
|-------|-----------|
| Auth | POST /api/auth/register, POST /api/auth/login, GET /api/auth/me |
| Users | GET /api/users/:username, PUT /api/profile, POST/DELETE /api/follow/:userId |
| Projects | CRUD /api/projects, POST /api/projects/:id/collaborate |
| Tasks | GET/POST /api/tasks, PATCH /api/tasks/:id/status, PUT/DELETE |
| Snippets | CRUD /api/snippets, POST /api/snippets/:id/like |
| PRs | GET/POST /api/prs, PATCH /api/prs/:id/status, POST /comments |
| AI | POST /api/ai/review-pr, /explain (SSE), /fix-bug, /generate (SSE), /review-code |
| Discussions | GET/POST /api/discussions, POST /:id/replies, /:id/like |
| Dashboard | GET /api/dashboard, /dashboard/tasks, /dashboard/activity |
| Admin | GET /api/admin/stats, /users, /flags, PATCH /suspend, /flags/:id |

## AI Integration (Ollama)

- All AI calls go through `server/ai/ollama.js`
- Uses Gemma4 model via local Ollama instance
- Streaming SSE for explain and generate endpoints
- Structured JSON responses for review and fix endpoints
- **Must have Ollama running** with the configured model

```bash
# Start Ollama
ollama serve

# Pull the model
ollama pull gemma4
```
