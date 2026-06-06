import { state } from "./store.js";
import { escapeHTML } from "./utils.js";

export function renderAnalytics() {
  renderFocusChart();
  renderCompletionDonut();
  renderCourseBreakdown();
  renderInsights();
}

function renderFocusChart() {
  const container = document.querySelector("#focusChart");
  const max = Math.max(...state.focusMinutes.map((item) => item.minutes));

  container.innerHTML = state.focusMinutes
    .map(
      (item) => `
        <div class="bar-column">
          <div class="bar-fill" style="height: ${(item.minutes / max) * 100}%"></div>
          <div class="bar-label">${item.day}</div>
          <div class="bar-value">${item.minutes}</div>
        </div>
      `
    )
    .join("");
}

function renderCompletionDonut() {
  const donut = document.querySelector("#completionDonut");
  const caption = document.querySelector("#completionCaption");
  const completed = state.tasks.filter((task) => task.status === "completed").length;
  const percent = state.tasks.length ? Math.round((completed / state.tasks.length) * 100) : 0;
  donut.style.setProperty("--angle", `${percent * 3.6}deg`);
  donut.dataset.label = `${percent}%`;
  caption.textContent = `${completed} of ${state.tasks.length} tracked tasks are complete.`;
}

function renderCourseBreakdown() {
  const container = document.querySelector("#courseBreakdown");
  const totals = state.tasks.reduce((courses, task) => {
    courses[task.course] = (courses[task.course] || 0) + Number(task.hours);
    return courses;
  }, {});
  const max = Math.max(...Object.values(totals));

  container.innerHTML = Object.entries(totals)
    .map(
      ([course, hours]) => `
        <article class="course-row">
          <header><strong>${escapeHTML(course)}</strong><span class="meta">${hours}h</span></header>
          <div class="progress-track"><div class="progress-fill" style="width: ${(hours / max) * 100}%"></div></div>
        </article>
      `
    )
    .join("");
}

function renderInsights() {
  const container = document.querySelector("#insightList");
  const high = state.tasks.filter((task) => task.priority === "High" && task.status !== "completed");
  const focus = state.focusMinutes.reduce((sum, item) => sum + item.minutes, 0);

  container.innerHTML = `
    <article class="insight-card">
      <strong>Win:</strong> You logged ${focus} focus minutes this week, enough for several deep work blocks.
    </article>
    <article class="insight-card">
      <strong>Risk:</strong> ${high.length} high-priority task${high.length === 1 ? "" : "s"} still need attention before the weekend.
    </article>
    <article class="insight-card">
      <strong>Next experiment:</strong> Try splitting long tasks into 50-minute sessions before adding new work.
    </article>
  `;
}
