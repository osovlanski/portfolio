const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");

const { createApp } = require("../server");
const { getDb, initializeSchema } = require("../db");
const { contentHash } = require("../seed");

const SEED_PATH = path.join(__dirname, "..", "seed-data.json");

// Claims that must never reach public content without evidence (see career_facts).
const BANNED = [
  /99\.99/,
  /\b10k\b/i,
  /20%/,
  /80 ?million/i,
  /\bvisa\b/i,
  /\bmastercard\b/i,
  /\bACH\b/,
  /terraform/i,
  /\bazure\b/i,
  /\bAML\b/,
  /\bKYC\b/,
  /\belite\b/i,
];

const ALLOWED_URLS = new Set([
  "https://www.linkedin.com/in/itay-osovlanski/",
  "https://github.com/osovlanski",
  "https://github.com/osovlanski/ai-control-plan",
  "https://github.com/osovlanski/pocketknife",
]);

let tmpDir;
let savedEnv;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-test-"));
  savedEnv = { ...process.env };
  process.env.DATABASE_PATH = path.join(tmpDir, "portfolio.db");
  delete process.env.ADMIN_ENABLED;
  process.env.NODE_ENV = "test";
});

afterEach(() => {
  process.env = savedEnv;
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function boot() {
  const app = createApp();
  return { app, close: () => app.locals.db.close() };
}

test("public API never exposes a phone number, even for a legacy database", async () => {
  // Legacy DB: a populated phone column and an up-to-date content hash, so no reseed happens.
  const db = getDb();
  initializeSchema(db);
  db.prepare(
    "INSERT INTO profile (id, name, title, email, phone, location, linkedin, github, summary) VALUES (1, 'T', 'T', 'a@b.c', '+972-50-000-0000', 'X', 'l', 'g', 's')"
  ).run();
  db.prepare("INSERT INTO meta (key, value) VALUES ('content_hash', ?)").run(contentHash());
  db.close();

  const { app, close } = boot();
  for (const route of ["/api/all", "/api/profile"]) {
    const res = await request(app).get(route).expect(200);
    const body = JSON.stringify(res.body);
    assert.ok(!body.includes("phone"), `${route} contains a phone key`);
    assert.ok(!body.includes("+972"), `${route} contains a phone number`);
  }
  close();
});

test("seed data and API output contain no disputed or unverified claims", async () => {
  const { app, close } = boot();
  const res = await request(app).get("/api/all").expect(200);
  const haystacks = [fs.readFileSync(SEED_PATH, "utf8"), JSON.stringify(res.body)];
  for (const text of haystacks) {
    for (const pattern of BANNED) {
      assert.ok(!pattern.test(text), `banned claim matched ${pattern}`);
    }
  }
  close();
});

test("Payoneer keeps the recorded title and shows the functional title separately", async () => {
  const { app, close } = boot();
  const res = await request(app).get("/api/experience").expect(200);
  const payoneer = res.body.find((exp) => exp.company === "Payoneer");
  assert.equal(payoneer.role, "Full Stack Developer");
  assert.equal(payoneer.functional_title, "Backend & License Infrastructure");
  close();
});

test("every public link is on the verified allow-list", async () => {
  const { app, close } = boot();
  const res = await request(app).get("/api/all").expect(200);
  const urls = [
    res.body.profile.linkedin,
    res.body.profile.github,
    ...res.body.projects.map((project) => project.repo_url),
  ];
  assert.ok(res.body.projects.length >= 2);
  for (const url of urls) assert.ok(ALLOWED_URLS.has(url), `unexpected URL ${url}`);
  close();
});

test("an existing database with an old content hash is reseeded after a backup", async () => {
  let { app, close } = boot();
  const db = app.locals.db;
  db.prepare("UPDATE meta SET value = 'oldhash0123456789' WHERE key = 'content_hash'").run();
  db.prepare("UPDATE profile SET title = 'Admin edited title' WHERE id = 1").run();
  close();

  ({ app, close } = boot());
  const res = await request(app).get("/api/profile").expect(200);
  assert.notEqual(res.body.title, "Admin edited title");
  const backups = fs.readdirSync(tmpDir).filter((name) => name.includes(".bak-oldhash0"));
  assert.equal(backups.length, 1, "expected a backup named after the previous hash");
  const health = await request(app).get("/health").expect(200);
  assert.equal(health.body.contentHash, contentHash());
  close();
});

test("an up-to-date database is not reseeded on boot", () => {
  let { app, close } = boot();
  const firstId = app.locals.db.prepare("SELECT MIN(id) AS id FROM experience").get().id;
  close();
  ({ app, close } = boot());
  const secondId = app.locals.db.prepare("SELECT MIN(id) AS id FROM experience").get().id;
  assert.equal(secondId, firstId);
  close();
});

test("admin routes are 404 when disabled and in production by default", async () => {
  process.env.ADMIN_ENABLED = "false";
  let { app, close } = boot();
  await request(app).post("/api/admin/login").send({ password: "x" }).expect(404);
  close();

  delete process.env.ADMIN_ENABLED;
  process.env.NODE_ENV = "production";
  ({ app, close } = boot());
  await request(app).post("/api/admin/login").send({ password: "x" }).expect(404);
  close();
});

test("production refuses to start with admin enabled and default secrets", () => {
  process.env.NODE_ENV = "production";
  process.env.ADMIN_ENABLED = "true";
  process.env.ADMIN_PASSWORD = "changeme";
  process.env.JWT_SECRET = "changeme-random-string";
  assert.throws(() => createApp(), /Refusing to start/);
});

test("admin login works with real secrets and rejects a wrong password", async () => {
  process.env.ADMIN_ENABLED = "true";
  process.env.ADMIN_PASSWORD = "test-password-not-real";
  process.env.JWT_SECRET = "test-jwt-secret-not-real";
  const { app, close } = boot();
  await request(app).post("/api/admin/login").send({ password: "wrong" }).expect(401);
  const ok = await request(app)
    .post("/api/admin/login")
    .send({ password: "test-password-not-real" })
    .expect(200);
  assert.ok(ok.body.token);
  close();
});
