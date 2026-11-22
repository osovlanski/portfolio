const express = require("express");
const cors = require("cors");
const path = require("path");
const { getDb, initializeSchema } = require("./db");
const { seed, contentHash } = require("./seed");

// Explicit column lists: never SELECT * from profile, so private columns
// (e.g. a legacy `phone` value in an older database) cannot reach public routes.
const PROFILE_COLUMNS = "id, name, title, email, location, linkedin, github, summary";
const EXPERIENCE_COLUMNS =
  "id, role, functional_title, company, location, start_date, end_date, description, sort_order";

function isAdminEnabled(env = process.env) {
  if (env.ADMIN_ENABLED !== undefined) return env.ADMIN_ENABLED === "true";
  return env.NODE_ENV !== "production";
}

function isDefaultSecret(value) {
  return !value || /^changeme/i.test(value);
}

function assertSafeAdminConfig(env = process.env) {
  if (!isAdminEnabled(env) || env.NODE_ENV !== "production") return;
  if (isDefaultSecret(env.JWT_SECRET) || isDefaultSecret(env.ADMIN_PASSWORD)) {
    throw new Error(
      "Refusing to start: admin is enabled in production with missing or default ADMIN_PASSWORD/JWT_SECRET."
    );
  }
}

// Seed when the database is empty, or when seed-data.json changed since the
// last seed (content hash differs). seed() backs up an existing database first.
function ensureContent(db) {
  const count = db.prepare("SELECT COUNT(*) AS count FROM profile").get().count;
  const stored = db.prepare("SELECT value FROM meta WHERE key = 'content_hash'").get();
  const current = contentHash();
  if (count === 0 || !stored || stored.value !== current) {
    seed();
    console.log(`Database seeded (content ${current.slice(0, 8)}).`);
  }
}

function createApp() {
  assertSafeAdminConfig();

  const app = express();
  app.use(cors());
  app.use(express.json());

  const db = getDb();
  initializeSchema(db);
  ensureContent(db);

  const getProjects = () =>
    db
      .prepare(
        "SELECT id, name, summary, repo_url, status FROM project ORDER BY sort_order ASC"
      )
      .all();

  app.get("/health", (req, res) => {
    const row = db.prepare("SELECT value FROM meta WHERE key = 'content_hash'").get();
    res.json({ ok: true, contentHash: row ? row.value : null });
  });

  // GET /api/profile
  app.get("/api/profile", (req, res) => {
    const profile = db
      .prepare(`SELECT ${PROFILE_COLUMNS} FROM profile WHERE id = 1`)
      .get();
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    const languages = db.prepare("SELECT name, level FROM language").all();
    res.json({ ...profile, languages });
  });

  // GET /api/experience
  app.get("/api/experience", (req, res) => {
    const experiences = db
      .prepare(`SELECT ${EXPERIENCE_COLUMNS} FROM experience ORDER BY sort_order ASC`)
      .all();

    const highlightStmt = db.prepare(
      "SELECT text FROM experience_highlight WHERE experience_id = ? ORDER BY sort_order ASC"
    );

    const result = experiences.map((exp) => {
      const highlights = highlightStmt.all(exp.id).map((row) => row.text);
      return { ...exp, highlights };
    });

    res.json(result);
  });

  // GET /api/education
  app.get("/api/education", (req, res) => {
    const educations = db
      .prepare("SELECT * FROM education ORDER BY sort_order ASC")
      .all();

    const highlightStmt = db.prepare(
      "SELECT text FROM education_highlight WHERE education_id = ?"
    );

    const result = educations.map((edu) => {
      const highlights = highlightStmt.all(edu.id).map((row) => row.text);
      return { ...edu, highlights };
    });

    res.json(result);
  });

  // GET /api/skills
  app.get("/api/skills", (req, res) => {
    const categories = db
      .prepare("SELECT * FROM skill_category ORDER BY sort_order ASC")
      .all();

    const skillStmt = db.prepare("SELECT name FROM skill WHERE category_id = ?");

    const technicalSkills = categories.map((cat) => {
      const items = skillStmt.all(cat.id).map((row) => row.name);
      return { category: cat.name, items };
    });

    const softSkills = db
      .prepare("SELECT name FROM soft_skill")
      .all()
      .map((row) => row.name);

    res.json({ technical: technicalSkills, soft: softSkills });
  });

  // GET /api/projects
  app.get("/api/projects", (req, res) => {
    res.json(getProjects());
  });

  // GET /api/all - convenience endpoint for fetching everything at once
  app.get("/api/all", (req, res) => {
    const profile = db
      .prepare(`SELECT ${PROFILE_COLUMNS} FROM profile WHERE id = 1`)
      .get();
    const languages = db.prepare("SELECT name, level FROM language").all();

    const experiences = db
      .prepare(`SELECT ${EXPERIENCE_COLUMNS} FROM experience ORDER BY sort_order ASC`)
      .all();
    const expHighlightStmt = db.prepare(
      "SELECT text FROM experience_highlight WHERE experience_id = ? ORDER BY sort_order ASC"
    );
    const experienceData = experiences.map((exp) => ({
      ...exp,
      highlights: expHighlightStmt.all(exp.id).map((row) => row.text),
    }));

    const educations = db
      .prepare("SELECT * FROM education ORDER BY sort_order ASC")
      .all();
    const eduHighlightStmt = db.prepare(
      "SELECT text FROM education_highlight WHERE education_id = ?"
    );
    const educationData = educations.map((edu) => ({
      ...edu,
      highlights: eduHighlightStmt.all(edu.id).map((row) => row.text),
    }));

    const categories = db
      .prepare("SELECT * FROM skill_category ORDER BY sort_order ASC")
      .all();
    const skillStmt = db.prepare("SELECT name FROM skill WHERE category_id = ?");
    const technicalSkills = categories.map((cat) => ({
      category: cat.name,
      items: skillStmt.all(cat.id).map((row) => row.name),
    }));
    const softSkills = db
      .prepare("SELECT name FROM soft_skill")
      .all()
      .map((row) => row.name);

    res.json({
      profile: { ...profile, languages },
      experience: experienceData,
      education: educationData,
      skills: { technical: technicalSkills, soft: softSkills },
      projects: getProjects(),
    });
  });

  // Admin CRUD routes (disabled by default in production)
  if (isAdminEnabled()) {
    app.use("/api/admin", require("./routes/admin"));
  } else {
    app.use("/api/admin", (req, res) => res.status(404).json({ error: "Not found" }));
  }

  // Unknown API paths must not fall through to the SPA shell
  app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

  // Production: serve frontend static files
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("/{*splat}", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });
  }

  app.locals.db = db;
  return app;
}

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  createApp().listen(PORT, () => {
    console.log(`Portfolio API running on http://localhost:${PORT}`);
  });
}

module.exports = { createApp, isAdminEnabled, assertSafeAdminConfig };
