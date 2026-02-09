const express = require("express");
const jwt = require("jsonwebtoken");
const { verifyAdmin } = require("../middleware/auth");
const { getDb } = require("../db");

const router = express.Router();

// --- Login (no auth required) ---
router.post("/login", (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  res.json({ token });
});

// All routes below require auth
router.use(verifyAdmin);

// --- Profile ---
router.put("/profile", (req, res) => {
  const db = getDb();
  const { name, title, email, phone, location, linkedin, github, summary } =
    req.body;
  db.prepare(
    `UPDATE profile SET name = ?, title = ?, email = ?, phone = ?, location = ?, linkedin = ?, github = ?, summary = ? WHERE id = 1`
  ).run(name, title, email, phone, location, linkedin, github, summary);
  res.json({ success: true });
});

// --- Experience ---
router.post("/experience", (req, res) => {
  const db = getDb();
  const { role, company, location, start_date, end_date, description, sort_order } =
    req.body;
  const result = db
    .prepare(
      `INSERT INTO experience (role, company, location, start_date, end_date, description, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(role, company, location, start_date, end_date, description, sort_order || 0);
  res.json({ id: result.lastInsertRowid });
});

router.put("/experience/:id", (req, res) => {
  const db = getDb();
  const { role, company, location, start_date, end_date, description, sort_order } =
    req.body;
  db.prepare(
    `UPDATE experience SET role = ?, company = ?, location = ?, start_date = ?, end_date = ?, description = ?, sort_order = ? WHERE id = ?`
  ).run(role, company, location, start_date, end_date, description, sort_order || 0, req.params.id);
  res.json({ success: true });
});

router.delete("/experience/:id", (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM experience WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.post("/experience/:id/highlights", (req, res) => {
  const db = getDb();
  const { highlights } = req.body;
  const experienceId = req.params.id;

  const replaceHighlights = db.transaction(() => {
    db.prepare("DELETE FROM experience_highlight WHERE experience_id = ?").run(
      experienceId
    );
    const insert = db.prepare(
      "INSERT INTO experience_highlight (experience_id, text, sort_order) VALUES (?, ?, ?)"
    );
    highlights.forEach((text, index) => {
      insert.run(experienceId, text, index);
    });
  });
  replaceHighlights();
  res.json({ success: true });
});

// --- Education ---
router.post("/education", (req, res) => {
  const db = getDb();
  const { institution, degree, location, start_date, end_date, sort_order } =
    req.body;
  const result = db
    .prepare(
      `INSERT INTO education (institution, degree, location, start_date, end_date, sort_order) VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(institution, degree, location, start_date, end_date, sort_order || 0);
  res.json({ id: result.lastInsertRowid });
});

router.put("/education/:id", (req, res) => {
  const db = getDb();
  const { institution, degree, location, start_date, end_date, sort_order } =
    req.body;
  db.prepare(
    `UPDATE education SET institution = ?, degree = ?, location = ?, start_date = ?, end_date = ?, sort_order = ? WHERE id = ?`
  ).run(institution, degree, location, start_date, end_date, sort_order || 0, req.params.id);
  res.json({ success: true });
});

router.delete("/education/:id", (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM education WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// --- Skills (bulk replace) ---
router.put("/skills", (req, res) => {
  const db = getDb();
  const { categories } = req.body;

  const replaceSkills = db.transaction(() => {
    db.prepare("DELETE FROM skill").run();
    db.prepare("DELETE FROM skill_category").run();
    const insertCategory = db.prepare(
      "INSERT INTO skill_category (name, sort_order) VALUES (?, ?)"
    );
    const insertSkill = db.prepare(
      "INSERT INTO skill (category_id, name) VALUES (?, ?)"
    );
    categories.forEach((cat, index) => {
      const result = insertCategory.run(cat.category, index);
      const categoryId = result.lastInsertRowid;
      cat.items.forEach((skillName) => {
        insertSkill.run(categoryId, skillName);
      });
    });
  });
  replaceSkills();
  res.json({ success: true });
});

// --- Soft Skills (bulk replace) ---
router.put("/soft-skills", (req, res) => {
  const db = getDb();
  const { items } = req.body;

  const replaceSoftSkills = db.transaction(() => {
    db.prepare("DELETE FROM soft_skill").run();
    const insert = db.prepare("INSERT INTO soft_skill (name) VALUES (?)");
    items.forEach((name) => insert.run(name));
  });
  replaceSoftSkills();
  res.json({ success: true });
});

// --- Languages (bulk replace) ---
router.put("/languages", (req, res) => {
  const db = getDb();
  const { items } = req.body;

  const replaceLanguages = db.transaction(() => {
    db.prepare("DELETE FROM language").run();
    const insert = db.prepare(
      "INSERT INTO language (name, level) VALUES (?, ?)"
    );
    items.forEach((lang) => insert.run(lang.name, lang.level));
  });
  replaceLanguages();
  res.json({ success: true });
});

module.exports = router;
