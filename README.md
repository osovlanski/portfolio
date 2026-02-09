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
| `GET /api/all`        | All data in a single response  |

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
