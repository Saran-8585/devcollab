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

### Option A — Docker (recommended)

**Prerequisites:** Docker Engine >= 24, Docker Compose >= 2.20

```bash
# Clone and enter the project
git clone https://github.com/Saran-8585/devcollab.git
cd devcollab

# Build and start all services
docker compose up --build -d

# Seed the database with sample data
docker compose exec server npm run seed

# Open http://localhost:8080
```

### Option B — Manual Setup

**Prerequisites:** Node.js >= 18, npm >= 9, MongoDB >= 7.0 (running on `localhost:27017`)

#### 1. Install Dependencies & Seed Database

```bash
# Install server dependencies
cd server
npm install

# Seed the database with sample data
npm run seed
```

#### 2. Start the Server

```bash
npm run dev
# Server runs on http://localhost:5000
```

#### 3. Start the Client

```bash
# In a new terminal
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

#### 4. Open the App

Navigate to **http://localhost:5173**

## Seed Credentials

| Email                | Password    | Role      |
| -------------------- | ----------- | --------- |
| alex@example.com     | password123 | Admin     |
| admin@devcollab.com  | admin123    | Admin     |
| dev1@devcollab.com   | dev123      | Developer |
| dev2@devcollab.com   | dev123      | Developer |
| demo@example.com     | password123 | Developer |

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

> When using Docker, environment variables are set in `docker-compose.yml`. The `.env` files on disk are ignored by the containers.

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
| Users | GET /api/users/:username, PUT /api/profile, POST/DELETE /api/users/follow/:userId |
| Projects | CRUD /api/projects, POST /api/projects/:id/collaborate |
| Tasks | GET /api/tasks/project/:projectId, POST /api/tasks, PUT/DELETE /api/tasks/:id |
| Snippets | CRUD /api/snippets, POST /api/snippets/:id/like |
| PRs | GET /api/prs/project/:projectId, GET /api/prs/:id, POST /api/prs, PATCH /api/prs/:id/status, POST /api/prs/:id/comments |
| Discussions | GET /api/discussions/project/:projectId, POST /api/discussions, POST /api/discussions/:id/replies |
| Dashboard | GET /api/dashboard |
| Activity | GET /api/activity, GET /api/activity/:entityType/:entityId |
| Admin | GET /api/admin/stats, GET /api/admin/users, PATCH /api/admin/users/:id/suspend, GET /api/admin/flags, PATCH /api/admin/flags/:id |
