const express = require("express");
const cors = require("cors");
const path = require("path");
const { getDb, initializeSchema } = require("./db");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const db = getDb();
initializeSchema(db);

// GET /api/profile
app.get("/api/profile", (req, res) => {
  const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }
  const languages = db.prepare("SELECT name, level FROM language").all();
  res.json({ ...profile, languages });
});

// GET /api/experience
app.get("/api/experience", (req, res) => {
  const experiences = db
    .prepare("SELECT * FROM experience ORDER BY sort_order ASC")
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

  const skillStmt = db.prepare(
    "SELECT name FROM skill WHERE category_id = ?"
  );

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

// GET /api/all - convenience endpoint for fetching everything at once
app.get("/api/all", (req, res) => {
  const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  const languages = db.prepare("SELECT name, level FROM language").all();

  const experiences = db
    .prepare("SELECT * FROM experience ORDER BY sort_order ASC")
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
  const skillStmt = db.prepare(
    "SELECT name FROM skill WHERE category_id = ?"
  );
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
  });
});

// Admin CRUD routes
app.use("/api/admin", adminRoutes);

// Production: serve frontend static files
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Portfolio API running on http://localhost:${PORT}`);
});
