import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "studyflow.sqlite");
const schemaPath = path.join(__dirname, "schema.sql");

sqlite3.verbose();

export const db = new sqlite3.Database(dbPath);

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function handleRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

export async function initDb() {
  const schema = fs.readFileSync(schemaPath, "utf8");

  await new Promise((resolve, reject) => {
    db.exec(schema, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  await seedRenderCheckUser();
}

async function seedRenderCheckUser() {
  const existing = await get("SELECT id FROM users WHERE email = ?", ["render-check@studyflow.test"]);

  if (existing) {
    return;
  }

  const result = await run("INSERT INTO users (name, email) VALUES (?, ?)", [
    "Render Check",
    "render-check@studyflow.test"
  ]);

  await seedUserData(result.id);
}

export async function seedUserData(userId) {
  const existingTasks = await get("SELECT id FROM tasks WHERE user_id = ? LIMIT 1", [userId]);

  if (!existingTasks) {
    const tasks = [
      ["Sprint 1 beta prototype", "CS 146J", "Project", "2026-05-26", "High", 5, "open"],
      ["Linear algebra problem set", "MATH 51", "Assignment", "2026-05-28", "Medium", 3, "open"],
      ["Biology midterm review", "BIO 82", "Exam", "2026-05-29", "High", 4, "open"],
      ["Reading response draft", "PWR 2", "Reading", "2026-05-30", "Low", 1.5, "completed"],
      ["Chemistry lab reflection", "CHEM 31", "Assignment", "2026-06-01", "Medium", 2, "open"]
    ];

    for (const task of tasks) {
      await run(
        `INSERT INTO tasks (user_id, title, course, type, due_date, priority, hours, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, ...task]
      );
    }
  }

  const existingSessions = await get("SELECT id FROM sessions WHERE user_id = ? LIMIT 1", [userId]);

  if (!existingSessions) {
    const sessions = [
      ["Monday", "09:00", "CS 146J", 75],
      ["Tuesday", "13:00", "BIO 82", 50],
      ["Wednesday", "10:30", "MATH 51", 50],
      ["Thursday", "15:00", "BIO 82", 75],
      ["Friday", "11:00", "CHEM 31", 25]
    ];

    for (const session of sessions) {
      await run("INSERT INTO sessions (user_id, day, time, subject, duration) VALUES (?, ?, ?, ?, ?)", [
        userId,
        ...session
      ]);
    }
  }

  const existingFocus = await get("SELECT id FROM focus_minutes WHERE user_id = ? LIMIT 1", [userId]);

  if (!existingFocus) {
    const focus = [
      ["Mon", 80],
      ["Tue", 110],
      ["Wed", 45],
      ["Thu", 95],
      ["Fri", 50],
      ["Sat", 30],
      ["Sun", 65]
    ];

    for (const item of focus) {
      await run("INSERT INTO focus_minutes (user_id, day, minutes) VALUES (?, ?, ?)", [userId, ...item]);
    }
  }
}
