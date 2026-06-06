import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initDb } from "./db.js";
import { analyticsRouter } from "./routes/analytics.js";
import { sessionsRouter } from "./routes/sessions.js";
import { tasksRouter } from "./routes/tasks.js";
import { usersRouter } from "./routes/users.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "..", "frontend");
const app = express();
const port = process.env.PORT || 8001;

app.use(express.json());
app.use("/api", usersRouter);
app.use("/api", tasksRouter);
app.use("/api", sessionsRouter);
app.use("/api", analyticsRouter);
app.use(express.static(frontendPath));

app.get("/", (_request, response) => {
  response.sendFile(path.join(frontendPath, "index.html"));
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "StudyFlow backend error." });
});

await initDb();

app.listen(port, () => {
  console.log(`StudyFlow running at http://127.0.0.1:${port}`);
});
