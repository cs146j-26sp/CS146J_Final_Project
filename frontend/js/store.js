const AUTH_KEY = "studyflow-active-student";
const API_BASE = "/api";

export const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const state = {
  tasks: [],
  sessions: [],
  focusMinutes: []
};

export function getActiveStudent() {
  const saved = localStorage.getItem(AUTH_KEY);
  return saved ? parseSavedJSON(saved) : null;
}

export function setActiveStudent(student) {
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      id: student.id,
      name: student.name.trim(),
      email: student.email.trim().toLowerCase()
    })
  );
}

export function clearActiveStudent() {
  localStorage.removeItem(AUTH_KEY);
}

export async function createAccount(student) {
  return apiRequest("/users", {
    method: "POST",
    body: student
  });
}

export async function loginAccount(student) {
  return apiRequest("/login", {
    method: "POST",
    body: student
  });
}

export async function loadState() {
  const student = getActiveStudent();

  if (!student?.id) {
    throw new Error("No active StudyFlow user.");
  }

  const [tasks, sessions, analytics] = await Promise.all([
    apiRequest(`/users/${student.id}/tasks`),
    apiRequest(`/users/${student.id}/sessions`),
    apiRequest(`/users/${student.id}/analytics`)
  ]);

  Object.assign(state, {
    tasks,
    sessions,
    focusMinutes: analytics.focusMinutes
  });
}

export function saveState() {
  return Promise.resolve();
}

export async function addTask(task) {
  const student = getActiveStudent();

  if (!student?.id) {
    throw new Error("Sign in before adding tasks.");
  }

  const created = await apiRequest(`/users/${student.id}/tasks`, {
    method: "POST",
    body: task
  });

  state.tasks.push(created);
  return created;
}

export async function toggleTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  const updated = await apiRequest(`/tasks/${id}`, {
    method: "PATCH",
    body: {
      status: task?.status === "completed" ? "open" : "completed"
    }
  });

  state.tasks = state.tasks.map((item) => (item.id === id ? updated : item));
  return updated;
}

export async function deleteTask(id) {
  await apiRequest(`/tasks/${id}`, {
    method: "DELETE"
  });

  state.tasks = state.tasks.filter((task) => task.id !== id);
}

export async function addSession(session) {
  const student = getActiveStudent();

  if (!student?.id) {
    throw new Error("Sign in before adding study sessions.");
  }

  const created = await apiRequest(`/users/${student.id}/sessions`, {
    method: "POST",
    body: session
  });

  state.sessions.push(created);
  return created;
}

export async function replaceSessions(sessions) {
  const student = getActiveStudent();

  if (!student?.id) {
    throw new Error("Sign in before updating the planner.");
  }

  const saved = await apiRequest(`/users/${student.id}/sessions`, {
    method: "PUT",
    body: { sessions }
  });

  state.sessions = saved;
  return saved;
}

export function sortedTasks() {
  return [...state.tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

function parseSavedJSON(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn("Ignoring invalid saved StudyFlow data.", error);
    return null;
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers: options.body
      ? {
          "Content-Type": "application/json"
        }
      : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "StudyFlow API request failed.");
  }

  return data;
}
