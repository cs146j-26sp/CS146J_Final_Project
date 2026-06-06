import express from "express";
import { all } from "../db.js";

export const analyticsRouter = express.Router();

analyticsRouter.get("/users/:userId/analytics", async (request, response) => {
  const focusMinutes = await all("SELECT day, minutes FROM focus_minutes WHERE user_id = ? ORDER BY id", [
    request.params.userId
  ]);

  response.json({ focusMinutes });
});
