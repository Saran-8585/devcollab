# DevCollab — Smart Developer Collaboration Platform

A GitHub-inspired developer collaboration platform built with React, Node.js, Express, and SQLite.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Recharts
- **Backend:** Node.js, Express.js (REST API)
- **Database:** SQLite via better-sqlite3
- **Auth:** JWT (localStorage)
- **Code Highlighting:** react-syntax-highlighter
- **Icons:** Lucide React

## Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9


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
- **Code Snippets** — Post, share, and discover code
- **Pull Requests** — Two-panel diff viewer, human reviews
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
| Discussions | GET/POST /api/discussions, POST /:id/replies, /:id/like |
| Dashboard | GET /api/dashboard, /dashboard/tasks, /dashboard/activity |
| Admin | GET /api/admin/stats, /users, /flags, PATCH /suspend, /flags/:id |


