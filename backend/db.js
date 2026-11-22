const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

function getDbPath() {
  return process.env.DATABASE_PATH || path.join(__dirname, "portfolio.db");
}

function getDb() {
  const DB_PATH = getDbPath();
  // Ensure parent directory exists (for Railway volume mounts)
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

function initializeSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      location TEXT,
      linkedin TEXT,
      github TEXT,
      summary TEXT
    );

    CREATE TABLE IF NOT EXISTS experience (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT,
      description TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS experience_highlight (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      experience_id INTEGER NOT NULL REFERENCES experience(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS education (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institution TEXT NOT NULL,
      degree TEXT NOT NULL,
      location TEXT,
      start_date TEXT,
      end_date TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS education_highlight (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      education_id INTEGER NOT NULL REFERENCES education(id) ON DELETE CASCADE,
      text TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS skill_category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS skill (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES skill_category(id) ON DELETE CASCADE,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS soft_skill (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS language (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      level TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS project (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      summary TEXT NOT NULL,
      repo_url TEXT,
      status TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Additive migration: formal title vs functional positioning.
  const experienceColumns = db
    .prepare("PRAGMA table_info(experience)")
    .all()
    .map((column) => column.name);
  if (!experienceColumns.includes("functional_title")) {
    db.exec("ALTER TABLE experience ADD COLUMN functional_title TEXT");
  }
}

module.exports = { getDb, getDbPath, initializeSchema };
