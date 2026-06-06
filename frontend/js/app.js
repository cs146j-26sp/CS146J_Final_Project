import { setupAssistant } from "./assistant.js";
import { renderAnalytics } from "./analytics.js";
import { renderDashboard } from "./dashboard.js";
import { setupLoginPage } from "./login.js";
import { setupNavigation } from "./navigation.js";
import { renderPlanner } from "./planner.js";
import { clearActiveStudent, getActiveStudent, loadState } from "./store.js";
import { renderTaskManager } from "./tasks.js";

document.addEventListener("DOMContentLoaded", async () => {
  setupNavigation();

  if (document.body.dataset.page === "login") {
    setupLoginPage();
    return;
  }

  if (requiresLogin() && !getActiveStudent()?.id) {
    clearActiveStudent();
    window.location.href = "../index.html";
    return;
  }

  try {
    await loadState();
  } catch (error) {
    console.error(error);
    clearActiveStudent();
    window.location.href = "../index.html";
    return;
  }
  setupAssistant();
  routePage();
});

function requiresLogin() {
  return document.body.dataset.page !== "login";
}
function routePage() {
  const page = document.body.dataset.page;

  if (page === "dashboard") {
    renderDashboard();
  }

  if (page === "tasks") {
    renderTaskManager();
  }

  if (page === "planner") {
    renderPlanner();
  }

  if (page === "analytics") {
    renderAnalytics();
  }

  if (page === "login") {
    setupLoginPage();
  }
}
