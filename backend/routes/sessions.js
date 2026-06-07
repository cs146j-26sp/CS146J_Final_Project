import express from "express";
import { all, get, run } from "../db.js";

export const sessionsRouter = express.Router();

sessionsRouter.get("/users/:userId/sessions", async (request, response) => {
  const sessions = await all(
    "SELECT id, day, time, subject, duration FROM sessions WHERE user_id = ? ORDER BY id",
    [request.params.userId]
  );

  response.json(sessions);
});

sessionsRouter.post("/users/:userId/sessions", async (request, response) => {
  const session = normalizeSession(request.body);

  if (!session) {
    response.status(400).json({ error: "A day, time, subject, and duration are required." });
    return;
  }

  const result = await run(
    "INSERT INTO sessions (user_id, day, time, subject, duration) VALUES (?, ?, ?, ?, ?)",
    [request.params.userId, session.day, session.time, session.subject, session.duration]
  );

  const created = await get("SELECT id, day, time, subject, duration FROM sessions WHERE id = ?", [result.id]);
  response.status(201).json(created);
});

sessionsRouter.put("/users/:userId/sessions", async (request, response) => {
  const sessions = Array.isArray(request.body.sessions) ? request.body.sessions.map(normalizeSession) : [];

  if (sessions.some((session) => !session)) {
    response.status(400).json({ error: "Every session needs a day, time, subject, and duration." });
    return;
  }

  await run("DELETE FROM sessions WHERE user_id = ?", [request.params.userId]);

  for (const session of sessions) {
    await run("INSERT INTO sessions (user_id, day, time, subject, duration) VALUES (?, ?, ?, ?, ?)", [
      request.params.userId,
      session.day,
      session.time,
      session.subject,
      session.duration
    ]);
  }

  const saved = await all("SELECT id, day, time, subject, duration FROM sessions WHERE user_id = ? ORDER BY id", [
    request.params.userId
  ]);

  response.json(saved);
});

function normalizeSession(body) {
  const day = String(body?.day || "").trim();
  const time = String(body?.time || "").trim();
  const subject = String(body?.subject || "").trim();
  const duration = Number(body?.duration);

  if (!day || !time || !subject || !duration) {
    return null;
  }

  return { day, time, subject, duration };
}
