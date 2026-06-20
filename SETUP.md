# DevCollab — Windows Setup Guide

A step-by-step guide to run the Smart Developer Collaboration Platform on Windows.

---

## Prerequisites

### 1. Install Node.js (v18 or later)

- Download the LTS installer from [nodejs.org](https://nodejs.org)
- Run the installer — ensure **"Add to PATH"** is checked
- Verify installation:

```cmd
node --version
npm --version
```

### 2. Install MongoDB

Choose **one** of the following options:

**Option A — MongoDB Community Server (local, recommended)**

- Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- Choose **MSI** installer for Windows
- During install, check **"Install MongoDB as a Service"**
- After install, verify MongoDB is running:

```cmd
mongosh
```

You should see a `test>` prompt. Type `exit` to quit.

**Option B — MongoDB Atlas (cloud, no local install)**

- Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Whitelist your IP address and create a database user
- Copy your connection string — you'll paste it in the `.env` file later

### 3. Install Git

- Download from [git-scm.com/download/win](https://git-scm.com/download/win)
- Use default installation options
- Verify:

```cmd
git --version
```

---

## Setup Steps

### 4. Clone the Repository

Open **Command Prompt** or **PowerShell** and run:

```cmd
git clone https://github.com/Saran-8585/devcollab.git
cd devcollab
```

### 5. Configure Environment Variables

The default `.env` files work out of the box. Review them if needed.

**server/.env:**

```
PORT=5000
JWT_SECRET=devcollab-super-secret-key-2024
MONGO_URI=mongodb://127.0.0.1:27017/devcollab
```

> If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

**client/.env:**

```
VITE_API_URL=http://localhost:5000/api
```

> If you change the server port, update this URL accordingly.

### 6. Install Dependencies & Seed Database

```cmd
cd server
npm install
npm run seed
```

This installs all backend packages and populates the database with sample data.

### 7. Start the Backend Server

```cmd
npm run dev
```

- Runs on `http://localhost:5000`
- Keep this terminal window open

### 8. Install Dependencies & Start the Frontend

Open a **second terminal** in the project root and run:

```cmd
cd client
npm install
npm run dev
```

- Runs on `http://localhost:5173`

### 9. Open the App

Navigate to **http://localhost:5173** in your browser.

**Demo credentials:**

| Email              | Password    |
| ------------------ | ----------- |
| demo@example.com   | password123 |

---

## Troubleshooting

| Issue                          | Fix                                                                                             |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| `mongosh` not found            | MongoDB is not on PATH. Reinstall or use MongoDB Compass. Or switch to MongoDB Atlas (Option B). |
| Port 5000 already in use       | Change `PORT=5001` in `server/.env`, then update `VITE_API_URL` in `client/.env` accordingly.    |
| `npm install` fails            | Run as Administrator. Try clearing npm cache: `npm cache clean --force` then retry.              |
| PowerShell execution policy    | Run `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` as Administrator.                     |
| Database connection refused    | Ensure MongoDB is running (`net start MongoDB` in Admin CMD).                                   |
| CORS errors in browser         | Verify the server is on a different port (5000) than the client (5173).                          |

---

## Docker Setup (Alternative — No Manual Installation Required)

If you have Docker Engine (>= 24) and Docker Compose (>= 2.20) installed, you can skip installing Node.js and MongoDB manually.

### Setup

```cmd
:: Clone the repository
git clone https://github.com/Saran-8585/devcollab.git
cd devcollab

:: Build and start all services
docker compose up --build -d

:: Seed the database with sample data
docker compose exec server npm run seed
```

### Usage

```cmd
:: Start all services
docker compose up -d

:: View logs
docker compose logs -f

:: Stop all services
docker compose down

:: Stop and delete volumes (clears database)
docker compose down -v
```

- **Frontend:** http://localhost
- **Backend API:** http://localhost/api/...
- **MongoDB:** localhost:27017

## Quick Reference

### Manual Setup

```cmd
# Clone
git clone https://github.com/Saran-8585/devcollab.git
cd devcollab

# Backend (Terminal 1)
cd server
npm install
npm run seed
npm run dev

# Frontend (Terminal 2)
cd client
npm install
npm run dev

# Open http://localhost:5173
```
