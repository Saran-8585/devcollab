# DevCollab — Smart Developer Collaboration Platform

A GitHub-inspired developer collaboration platform built with React, Node.js, Express, and MongoDB.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Recharts
- **Backend:** Node.js, Express.js (REST API)
- **Database:** MongoDB via Mongoose ODM
- **Auth:** JWT (localStorage)
- **Code Highlighting:** react-syntax-highlighter
- **Icons:** Lucide React

## Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9
- MongoDB >= 7.0 (running on `localhost:27017`)

### 1. Install Dependencies & Seed Database

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

| Email | Password |
|-------|----------|
| demo@example.com | password123 |

## Environment Variables

### Server (.env)
```
PORT=5000
JWT_SECRET=devcollab-super-secret-key-2024
MONGO_URI=mongodb://127.0.0.1:27017/devcollab
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Features

- **Authentication** — Register/Login with JWT
- **Developer Profiles** — Activity feed, projects, snippets, follow/unfollow
- **Project Management** — Kanban tasks, code snippets, PRs, threaded discussions
- **Code Snippets** — Post, share, like, and discover code
- **Pull Requests** — Two-panel diff viewer, comments
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
│   ├── controllers/           # Route handlers (async Mongoose)
│   ├── db/                    # Database connection + seed script
│   ├── middleware/            # Auth middleware
│   ├── models/                # 13 Mongoose schemas
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
| Discussions | GET/POST /api/discussions, POST /:id/replies |
| Dashboard | GET /api/dashboard, /dashboard/activity |
| Admin | GET /api/admin/stats, /users, PATCH /role, /suspend |
