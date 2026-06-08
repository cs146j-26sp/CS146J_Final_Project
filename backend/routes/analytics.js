import express from "express";
import { all, get, run } from "../db.js";

export const analyticsRouter = express.Router();

analyticsRouter.get("/users/:userId/analytics", async (request, response) => {
  const focusMinutes = await all("SELECT day, minutes FROM focus_minutes WHERE user_id = ? ORDER BY id", [
    request.params.userId
  ]);

  response.json({ focusMinutes });
});

analyticsRouter.post("/users/:userId/focus-minutes", async (request, response) => {
  const day = String(request.body?.day || "").trim();
  const minutes = Number(request.body?.minutes);

  if (!day || !Number.isInteger(minutes) || minutes <= 0) {
    response.status(400).json({ error: "A day and positive whole-number minutes are required." });
    return;
  }

  const existing = await get("SELECT id, minutes FROM focus_minutes WHERE user_id = ? AND day = ?", [
    request.params.userId,
    day
  ]);

  if (existing) {
    await run("UPDATE focus_minutes SET minutes = ? WHERE id = ?", [existing.minutes + minutes, existing.id]);
  } else {
    await run("INSERT INTO focus_minutes (user_id, day, minutes) VALUES (?, ?, ?)", [
      request.params.userId,
      day,
      minutes
    ]);
  }

  const focusMinutes = await all("SELECT day, minutes FROM focus_minutes WHERE user_id = ? ORDER BY id", [
    request.params.userId
  ]);

  response.json({ focusMinutes });
});
