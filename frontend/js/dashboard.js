import { addTask, getActiveStudent, sortedTasks, state, toggleTask } from "./store.js";
import { escapeHTML, formatDate, priorityTag } from "./utils.js";

export function renderDashboard() {
  renderDashboardGreeting();
  renderTodayFocus();
  renderDashboardTasks();
  renderMetrics();
  renderRecommendation();
  setupQuickTaskForm();
}

function renderDashboardGreeting() {
  const target = document.querySelector("#dashboardGreeting");
  const student = getActiveStudent();

  if (!target || !student) {
    return;
  }

  target.innerHTML = `${getTimeGreeting()}, welcome back <span>${escapeHTML(formatStudentName(student.name))}</span>.`;
}

function getTimeGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function formatStudentName(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function setupQuickTaskForm() {
  const form = document.querySelector("#quickTaskForm");

  if (form.dataset.ready === "true") {
    return;
  }

  form.dataset.ready = "true";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    addTask({
      title: data.get("title"),
      course: data.get("course"),
      type: "Assignment",
      dueDate: data.get("dueDate"),
      priority: data.get("priority"),
      hours: 2,
      status: "open"
    });
    form.reset();
    renderDashboardTasks();
    renderTodayFocus();
    renderMetrics();
    renderRecommendation();
  });
}

function renderTodayFocus() {
  const container = document.querySelector("#todayFocus");
  const urgent = sortedTasks().filter((task) => task.status !== "completed").slice(0, 3);

  container.innerHTML = urgent
    .map(
      (task) => `
        <article class="focus-card">
          <h3>${escapeHTML(task.title)}</h3>
          <p class="meta">${escapeHTML(task.course)} · due ${formatDate(task.dueDate)} · ${task.hours}h remaining</p>
          <div class="tag-row">${priorityTag(task.priority)}</div>
        </article>
      `
    )
    .join("");
}

function renderDashboardTasks() {
  const container = document.querySelector("#dashboardTasks");
  container.innerHTML = sortedTasks()
    .slice(0, 4)
    .map((task) => taskCard(task, false))
    .join("");

  container.querySelectorAll("[data-toggle-task]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleTask(Number(button.dataset.toggleTask));
      renderDashboardTasks();
      renderTodayFocus();
      renderMetrics();
      renderRecommendation();
    });
  });
}

function renderMetrics() {
  const container = document.querySelector("#dashboardMetrics");
  const open = state.tasks.filter((task) => task.status !== "completed").length;
  const completed = state.tasks.filter((task) => task.status === "completed").length;
  const focus = state.focusMinutes.reduce((sum, item) => sum + item.minutes, 0);
  const highPriority = state.tasks.filter((task) => task.priority === "High" && task.status !== "completed").length;

  container.innerHTML = `
    <div class="metric-card"><strong>${open}</strong><span>open tasks</span></div>
    <div class="metric-card"><strong>${completed}</strong><span>completed</span></div>
    <div class="metric-card"><strong>${Math.round(focus / 60)}h</strong><span>focus this week</span></div>
    <div class="metric-card"><strong>${highPriority}</strong><span>high priority</span></div>
  `;
}

function renderRecommendation() {
  const target = document.querySelector("#smartRecommendation");
  const next = sortedTasks().find((task) => task.status !== "completed");

  if (!next) {
    target.textContent = "Everything in the current queue is complete. Add your next deadline to keep the plan useful.";
    return;
  }

  target.textContent = `Start with ${next.title} for ${next.course}. It is ${next.priority.toLowerCase()} priority and due ${formatDate(next.dueDate)}, so the planner reserved earlier focus blocks for it.`;
}

function taskCard(task) {
  const actionLabel = task.status === "completed" ? "Reopen" : "Mark done";

  return `
    <article class="task-card">
      <div>
        <h3>${escapeHTML(task.title)}</h3>
        <p class="meta">${escapeHTML(task.course)} · ${escapeHTML(task.type)} · due ${formatDate(task.dueDate)}</p>
        <div class="tag-row">${priorityTag(task.priority)} <span class="tag">${task.status}</span></div>
      </div>
      <button class="small-action" type="button" data-toggle-task="${task.id}">${actionLabel}</button>
    </article>
  `;
}
