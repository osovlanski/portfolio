const { getDb, initializeSchema } = require("./db");
const seedData = require("./seed-data.json");

function seed() {
  const db = getDb();
  initializeSchema(db);

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
      DELETE FROM profile;
    `);
  });
  clearTables();

  const insertProfile = db.prepare(`
    INSERT INTO profile (id, name, title, email, phone, location, linkedin, github, summary)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertExperience = db.prepare(`
    INSERT INTO experience (role, company, location, start_date, end_date, description, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
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

  const insertLanguage = db.prepare(`
    INSERT INTO language (name, level) VALUES (?, ?)
  `);

  const seedAll = db.transaction(() => {
    const profile = seedData.profile;
    insertProfile.run(
      profile.name,
      profile.title,
      profile.email,
      profile.phone,
      profile.location,
      profile.linkedin,
      profile.github,
      profile.summary
    );

    seedData.experience.forEach((exp, index) => {
      const result = insertExperience.run(
        exp.role,
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
  });

  seedAll();
  db.close();

  console.log("Database seeded successfully.");
}

seed();
