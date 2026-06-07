import express from "express";
import { get, run, seedUserData } from "../db.js";

export const usersRouter = express.Router();

usersRouter.post("/users", async (request, response) => {
  const name = String(request.body.name || "").trim();
  const email = String(request.body.email || "").trim().toLowerCase();

  if (!name || !email) {
    response.status(400).json({ error: "Name and email are required." });
    return;
  }

  const matchingName = await get("SELECT id FROM users WHERE lower(name) = lower(?)", [name]);

  if (matchingName) {
    response.status(409).json({ error: "That user name is already taken." });
    return;
  }

  const matchingEmail = await get("SELECT id FROM users WHERE email = ?", [email]);

  if (matchingEmail) {
    response.status(409).json({ error: "That email is already linked to an account. Sign in instead." });
    return;
  }

  const result = await run("INSERT INTO users (name, email) VALUES (?, ?)", [name, email]);
  await seedUserData(result.id);

  response.status(201).json({ id: result.id, name, email });
});

usersRouter.post("/login", async (request, response) => {
  const name = String(request.body.name || "").trim();
  const email = String(request.body.email || "").trim().toLowerCase();

  if (!name || !email) {
    response.status(400).json({ error: "Name and email are required." });
    return;
  }

  const user = await get("SELECT id, name, email FROM users WHERE email = ? AND lower(name) = lower(?)", [email, name]);

  if (!user) {
    response.status(404).json({ error: "No account matches those details. Create an account first." });
    return;
  }

  response.json(user);
});
