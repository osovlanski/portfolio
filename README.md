# Itay Osovlanski - Portfolio Website

A full-stack portfolio website with a Node.js/Express backend (SQLite) and React frontend (Tailwind CSS).

## Project Structure

```
portfolio/
├── backend/
│   ├── server.js        # Express API server
│   ├── db.js            # SQLite database setup & schema
│   ├── seed.js          # Database seeding script
│   ├── seed-data.json   # Structured CV data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components (Navbar, Hero, Experience, Skills, Education, Contact)
│   │   ├── App.jsx      # Main app with API data fetching
│   │   ├── index.css    # Tailwind CSS configuration
│   │   └── main.jsx     # React entry point
│   ├── index.html
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+
- npm

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
npm run seed    # Populate the database with CV data
npm start       # Starts API on http://localhost:3001
```

**API Endpoints:**

| Endpoint          | Description                        |
|-------------------|------------------------------------|
| `GET /api/profile`    | Profile info and languages     |
| `GET /api/experience` | Work experience with highlights|
| `GET /api/education`  | Education history              |
| `GET /api/skills`     | Technical and soft skills      |
| `GET /api/projects`   | Public project cards           |
| `GET /api/all`        | All data in a single response  |
| `GET /health`         | Liveness and current content hash |

**Content source of truth:** `backend/seed-data.json`. On boot the server compares the
SHA-256 of that file with `meta.content_hash` in the database. If they differ (or the
database is empty) it reseeds. Before reseeding a non-empty database it copies the file to
`<DATABASE_PATH>.bak-<previous hash prefix>` (last 3 kept). Edits made in the admin panel are
overwritten whenever the seed file changes. `GET /health` returns the current `contentHash`.

**Rollback:** redeploy the previous commit. The hash changes back, so the old content is
reseeded automatically. If the previous commit predates hash tracking and a volume holds the
database, restore the matching `.bak-*` file instead.

**Privacy:** the phone number is not stored or served. Public routes use explicit column lists.

**Admin panel:** disabled by default in production (`ADMIN_ENABLED=true` enables it). In production
the server refuses to start with admin enabled and a missing or `changeme` `ADMIN_PASSWORD`/`JWT_SECRET`.

**Tests:** `npm test` at the repo root runs backend tests, frontend lint and the production build.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev     # Starts dev server on http://localhost:5173
```

The frontend proxies `/api` requests to the backend at `localhost:3001` during development.

### Production Build

```bash
cd frontend
npm run build   # Output in frontend/dist/
```

## Tech Stack

- **Backend:** Node.js, Express, better-sqlite3
- **Frontend:** React, Vite, Tailwind CSS v4
- **Database:** SQLite
