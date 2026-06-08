import { addFocusMinutes, state } from "./store.js";
import { escapeHTML } from "./utils.js";

let timerSeconds = 0;
let timerId = null;

export function renderAnalytics() {
  setupFocusTimer();
  renderFocusChart();
  renderCompletionDonut();
  renderCourseBreakdown();
  renderInsights();
}

function renderFocusChart(liveMinutes = getTimerMinutes()) {
  const container = document.querySelector("#focusChart");
  const focusMinutes = getFocusMinutesWithLiveTime(liveMinutes);
  const max = Math.max(...focusMinutes.map((item) => item.minutes), 1);

  container.innerHTML = focusMinutes
    .map((item) => {
      const level = getFocusLevel(item.minutes);
      const liveLabel = item.isLive ? " live" : "";

      return `
        <div class="bar-column ${level.className}">
          <div class="bar-fill" style="height: ${(item.minutes / max) * 100}%" aria-label="${item.day}: ${item.minutes} focus minutes${liveLabel}"></div>
          <div class="bar-label">${item.day}</div>
          <div class="bar-value">${item.minutes}${item.isLive ? " live" : ""}</div>
        </div>
      `;
    })
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
  const max = Math.max(...Object.values(totals), 1);

  container.innerHTML = `
    <div class="load-key" aria-label="Load color key">
      <span><i class="load-swatch light"></i>Light</span>
      <span><i class="load-swatch steady"></i>Steady</span>
      <span><i class="load-swatch heavy"></i>Heavy</span>
      <span><i class="load-swatch intense"></i>Intense</span>
    </div>
    ${Object.entries(totals)
      .map(([course, hours]) => {
        const load = getLoadLevel(hours);

        return `
        <article class="course-row ${load.className}">
          <header><strong>${escapeHTML(course)}</strong><span class="meta">${hours}h</span></header>
          <div class="progress-track" aria-label="${escapeHTML(course)} has ${load.label} load">
            <div class="progress-fill" style="width: ${(hours / max) * 100}%"></div>
          </div>
        </article>
      `;
      })
      .join("")}
  `;
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

function getFocusLevel(minutes) {
  if (minutes < 60) {
    return { className: "low-minutes" };
  }

  if (minutes < 120) {
    return { className: "medium-minutes" };
  }

  return { className: "high-minutes" };
}

function getLoadLevel(hours) {
  if (hours < 2) {
    return { className: "load-light", label: "light" };
  }

  if (hours < 4) {
    return { className: "load-steady", label: "steady" };
  }

  if (hours < 6) {
    return { className: "load-heavy", label: "heavy" };
  }

  return { className: "load-intense", label: "intense" };
}

function setupFocusTimer() {
  const startButton = document.querySelector("#focusTimerStart");
  const resetButton = document.querySelector("#focusTimerReset");
  const saveButton = document.querySelector("#focusTimerSave");

  if (!startButton || startButton.dataset.ready === "true") {
    return;
  }

  startButton.dataset.ready = "true";
  startButton.addEventListener("click", () => {
    if (timerId) {
      pauseTimer();
      return;
    }

    startTimer();
  });

  resetButton.addEventListener("click", () => {
    pauseTimer();
    timerSeconds = 0;
    updateTimerDisplay();
    renderFocusChart();
  });

  saveButton.addEventListener("click", saveTimerMinutes);
  updateTimerDisplay();
}

function startTimer() {
  timerId = window.setInterval(() => {
    timerSeconds += 1;
    updateTimerDisplay();
    renderFocusChart();
  }, 1000);

  updateTimerDisplay();
}

function pauseTimer() {
  if (!timerId) {
    return;
  }

  window.clearInterval(timerId);
  timerId = null;
  updateTimerDisplay();
}

async function saveTimerMinutes() {
  const minutes = Math.floor(timerSeconds / 60);
  const status = document.querySelector("#focusTimerStatus");

  if (minutes < 1) {
    status.textContent = "Track at least 1 minute before saving.";
    return;
  }

  pauseTimer();
  await addFocusMinutes({
    day: getTodayLabel(),
    minutes
  });
  timerSeconds = 0;
  updateTimerDisplay("Saved to Analytics");
  renderFocusChart();
  renderInsights();
}

function updateTimerDisplay(message) {
  const display = document.querySelector("#focusTimerDisplay");
  const status = document.querySelector("#focusTimerStatus");
  const startButton = document.querySelector("#focusTimerStart");

  if (!display || !status || !startButton) {
    return;
  }

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  display.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  status.textContent = message || (timerId ? "Tracking focus time" : "Paused");
  startButton.textContent = timerId ? "Pause" : "Start";
}

function getTimerMinutes() {
  return Math.floor(timerSeconds / 60);
}

function getFocusMinutesWithLiveTime(liveMinutes) {
  const today = getTodayLabel();
  const focusMinutes = state.focusMinutes.map((item) => ({ ...item }));

  if (liveMinutes < 1) {
    return focusMinutes;
  }

  const todayEntry = focusMinutes.find((item) => item.day === today);

  if (todayEntry) {
    todayEntry.minutes += liveMinutes;
    todayEntry.isLive = true;
  } else {
    focusMinutes.push({ day: today, minutes: liveMinutes, isLive: true });
  }

  return focusMinutes;
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date());
}
