# Smart Resume AI - Monorepo

Smart Resume AI is structured as a decoupled monorepo containing a modern Next.js frontend and an independent Node.js / Express backend API server.

---

## Architecture Overview

```
builder/
├── frontend/             # Next.js 16 Web Application (React 19, Tailwind CSS v4)
│   ├── src/
│   │   ├── app/          # App Router Pages & Layouts (/builder, /analyzer, /dashboard, etc.)
│   │   ├── components/   # UI & Resume Templates (A4 resume layout engine)
│   │   ├── context/      # State management & themes
│   │   ├── lib/          # Utilities & mock data
│   │   └── types/        # TypeScript definitions
│   ├── public/           # Static public assets
│   ├── next.config.ts    # Configured with proxy rewrites: /api/* -> http://localhost:5000/api/*
│   └── package.json
│
├── backend/              # Node.js / Express REST API Server
│   ├── src/
│   │   ├── db/           # SQLite database engine (node:sqlite with WAL mode)
│   │   ├── routes/       # API endpoints (/auth, /admin, /resume, /jobs, /skills, /user, etc.)
│   │   ├── services/     # Gemini AI ATS evaluation, text extraction (PDF/DOCX), session tracking
│   │   └── server.ts     # Express server listening on http://localhost:5000
│   ├── data/             # Persistent SQLite database (smart_resume.db)
│   ├── .env              # Environment configurations & secrets
│   └── package.json
│
├── package.json          # Root workspace orchestrator
└── README.md
```

---

## Getting Started

### 1. Install Dependencies
Run from the repository root:
```bash
npm install
```
Or install in each directory individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Run Both Services Concurrently
```bash
npm run dev
```

### 3. Run Services Separately

#### Run Backend Server (Port 5000)
```bash
npm run dev:backend
# or: cd backend && npm run dev
```
- Server API: [http://localhost:5000](http://localhost:5000)
- Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

#### Run Frontend Application (Port 3000)
```bash
npm run dev:frontend
# or: cd frontend && npm run dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)
- Resume Builder: [http://localhost:3000/builder](http://localhost:3000/builder)
- Resume Analyzer: [http://localhost:3000/analyzer](http://localhost:3000/analyzer)
- User Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- Admin Portal: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## API Proxying & Communication
- The Next.js frontend automatically proxies all `/api/*` requests to the backend server at `http://localhost:5000/api/*` via `next.config.ts` rewrites.
- Direct API calls can also be made to `http://localhost:5000/api/*` with full CORS support.
