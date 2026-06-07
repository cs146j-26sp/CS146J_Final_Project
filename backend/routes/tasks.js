import express from "express";
import { all, get, run } from "../db.js";

export const tasksRouter = express.Router();

tasksRouter.get("/users/:userId/tasks", async (request, response) => {
  const tasks = await all(
    `SELECT id, title, course, type, due_date AS dueDate, priority, hours, status
     FROM tasks WHERE user_id = ? ORDER BY date(due_date), id`,
    [request.params.userId]
  );

  response.json(tasks);
});

tasksRouter.post("/users/:userId/tasks", async (request, response) => {
  const task = normalizeTask(request.body);

  if (!task) {
    response.status(400).json({ error: "A title, course, type, due date, priority, and hours are required." });
    return;
  }

  const result = await run(
    `INSERT INTO tasks (user_id, title, course, type, due_date, priority, hours, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      request.params.userId,
      task.title,
      task.course,
      task.type,
      task.dueDate,
      task.priority,
      task.hours,
      task.status
    ]
  );

  const created = await get(
    `SELECT id, title, course, type, due_date AS dueDate, priority, hours, status
     FROM tasks WHERE id = ?`,
    [result.id]
  );

  response.status(201).json(created);
});

tasksRouter.patch("/tasks/:taskId", async (request, response) => {
  const existing = await get("SELECT id, status FROM tasks WHERE id = ?", [request.params.taskId]);

  if (!existing) {
    response.status(404).json({ error: "Task not found." });
    return;
  }

  const status = request.body.status || (existing.status === "completed" ? "open" : "completed");

  if (!["open", "completed"].includes(status)) {
    response.status(400).json({ error: "Task status must be open or completed." });
    return;
  }

  await run("UPDATE tasks SET status = ? WHERE id = ?", [status, request.params.taskId]);
  const task = await get(
    `SELECT id, title, course, type, due_date AS dueDate, priority, hours, status
     FROM tasks WHERE id = ?`,
    [request.params.taskId]
  );

  response.json(task);
});

tasksRouter.delete("/tasks/:taskId", async (request, response) => {
  const result = await run("DELETE FROM tasks WHERE id = ?", [request.params.taskId]);

  if (!result.changes) {
    response.status(404).json({ error: "Task not found." });
    return;
  }

  response.status(204).end();
});

function normalizeTask(body) {
  const title = String(body.title || "").trim();
  const course = String(body.course || "").trim();
  const type = String(body.type || "").trim();
  const dueDate = String(body.dueDate || "").trim();
  const priority = String(body.priority || "").trim();
  const hours = Number(body.hours);
  const status = body.status === "completed" ? "completed" : "open";

  if (!title || !course || !type || !dueDate || !["High", "Medium", "Low"].includes(priority) || !hours) {
    return null;
  }

  return { title, course, type, dueDate, priority, hours, status };
}
