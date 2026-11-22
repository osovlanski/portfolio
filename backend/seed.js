const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getDb, getDbPath, initializeSchema } = require("./db");

const SEED_PATH = path.join(__dirname, "seed-data.json");
const BACKUPS_TO_KEEP = 3;

// Hash of the exact seed file bytes. Reverting seed-data.json reverts the hash,
// so a rollback deploy restores the previous content automatically.
function contentHash() {
  return crypto.createHash("sha256").update(fs.readFileSync(SEED_PATH)).digest("hex");
}

function backupExistingDatabase(db, previousHash) {
  const dbPath = getDbPath();
  if (!fs.existsSync(dbPath)) return null;
  db.pragma("wal_checkpoint(TRUNCATE)");
  const suffix = previousHash ? previousHash.slice(0, 8) : "unversioned";
  const backupPath = `${dbPath}.bak-${suffix}`;
  fs.copyFileSync(dbPath, backupPath);

  const dir = path.dirname(dbPath);
  const prefix = `${path.basename(dbPath)}.bak-`;
  const backups = fs
    .readdirSync(dir)
    .filter((name) => name.startsWith(prefix))
    .map((name) => ({ name, mtime: fs.statSync(path.join(dir, name)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  backups.slice(BACKUPS_TO_KEEP).forEach((old) => fs.unlinkSync(path.join(dir, old.name)));
  return backupPath;
}

function seed() {
  const seedData = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
  const hash = contentHash();
  const db = getDb();
  initializeSchema(db);

  const hasContent = db.prepare("SELECT COUNT(*) AS count FROM profile").get().count > 0;
  if (hasContent) {
    const previous = db.prepare("SELECT value FROM meta WHERE key = 'content_hash'").get();
    backupExistingDatabase(db, previous && previous.value);
  }

  const clearTables = db.transaction(() => {
    db.exec(`
      DELETE FROM experience_highlight;
      DELETE FROM experience;
      DELETE FROM education_highlight;
      DELETE FROM education;
      DELETE FROM skill;
      DELETE FROM skill_category;
      DELETE FROM soft_skill;
      DELETE FROM language;
      DELETE FROM project;
      DELETE FROM profile;
    `);
  });
  clearTables();

  const insertProfile = db.prepare(`
    INSERT INTO profile (id, name, title, email, location, linkedin, github, summary)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertExperience = db.prepare(`
    INSERT INTO experience (role, functional_title, company, location, start_date, end_date, description, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertExperienceHighlight = db.prepare(`
    INSERT INTO experience_highlight (experience_id, text, sort_order)
    VALUES (?, ?, ?)
  `);

  const insertEducation = db.prepare(`
    INSERT INTO education (institution, degree, location, start_date, end_date, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertEducationHighlight = db.prepare(`
    INSERT INTO education_highlight (education_id, text)
    VALUES (?, ?)
  `);

  const insertSkillCategory = db.prepare(`
    INSERT INTO skill_category (name, sort_order) VALUES (?, ?)
  `);

  const insertSkill = db.prepare(`
    INSERT INTO skill (category_id, name) VALUES (?, ?)
  `);

  const insertSoftSkill = db.prepare(`
    INSERT INTO soft_skill (name) VALUES (?)
  `);

  const insertProject = db.prepare(`
    INSERT INTO project (name, summary, repo_url, status, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertLanguage = db.prepare(`
    INSERT INTO language (name, level) VALUES (?, ?)
  `);

  const seedAll = db.transaction(() => {
    const profile = seedData.profile;
    insertProfile.run(
      profile.name,
      profile.title,
      profile.email,
      profile.location,
      profile.linkedin,
      profile.github,
      profile.summary
    );

    seedData.experience.forEach((exp, index) => {
      const result = insertExperience.run(
        exp.role,
        exp.functionalTitle || null,
        exp.company,
        exp.location,
        exp.startDate,
        exp.endDate,
        exp.description,
        index
      );
      const experienceId = result.lastInsertRowid;
      exp.highlights.forEach((highlight, highlightIndex) => {
        insertExperienceHighlight.run(experienceId, highlight, highlightIndex);
      });
    });

    seedData.education.forEach((edu, index) => {
      const result = insertEducation.run(
        edu.institution,
        edu.degree,
        edu.location,
        edu.startDate,
        edu.endDate,
        index
      );
      const educationId = result.lastInsertRowid;
      edu.highlights.forEach((highlight) => {
        insertEducationHighlight.run(educationId, highlight);
      });
    });

    seedData.skills.forEach((category, index) => {
      const result = insertSkillCategory.run(category.category, index);
      const categoryId = result.lastInsertRowid;
      category.items.forEach((skillName) => {
        insertSkill.run(categoryId, skillName);
      });
    });

    seedData.softSkills.forEach((skillName) => {
      insertSoftSkill.run(skillName);
    });

    seedData.languages.forEach((lang) => {
      insertLanguage.run(lang.language, lang.level);
    });

    (seedData.projects || []).forEach((project, index) => {
      insertProject.run(project.name, project.summary, project.repoUrl, project.status, index);
    });

    db.prepare(
      "INSERT INTO meta (key, value) VALUES ('content_hash', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    ).run(hash);
  });

  seedAll();
  db.close();

  console.log("Database seeded successfully.");
}

// Run directly when called as script, export for programmatic use
if (require.main === module) {
  seed();
}

module.exports = { seed, contentHash };
