import { addSession, dayOrder, replaceSessions, sortedTasks, state } from "./store.js";
import { escapeHTML, formatTime } from "./utils.js";

const defaultCalendarHours = Array.from({ length: 13 }, (_, index) => index + 8);

export function renderPlanner() {
  setupSessionForm();
  document.querySelector("#regeneratePlan").addEventListener("click", async () => {
    await replaceSessions(generateSessionsFromTasks());
    renderWeekPlan();
  });
  renderWeekPlan();
}

function setupSessionForm() {
  const form = document.querySelector("#sessionForm");

  if (form.dataset.ready === "true") {
    return;
  }

  form.dataset.ready = "true";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    await addSession({
      subject: data.get("subject"),
      day: data.get("day"),
      time: data.get("time"),
      duration: Number(data.get("duration"))
    });
    form.reset();
    renderWeekPlan();
  });
}

function renderWeekPlan() {
  const container = document.querySelector("#weekPlan");
  const calendarHours = getCalendarHours();
  container.innerHTML = `
    <div class="calendar-corner" aria-hidden="true">Time</div>
    ${dayOrder.map((day) => `<div class="calendar-day-heading">${day}</div>`).join("")}
    ${calendarHours
      .map(
        (hour) => `
          <div class="calendar-time">${formatHour(hour)}</div>
          ${dayOrder.map((day) => renderCalendarCell(day, hour)).join("")}
        `
      )
      .join("")}
  `;

  setupCalendarInteractions(container);
}

function generateSessionsFromTasks() {
  const openTasks = sortedTasks().filter((task) => task.status !== "completed");
  const generated = [];
  let dayIndex = 0;

  openTasks.forEach((task) => {
    const blocks = task.priority === "High" ? 2 : 1;
    for (let block = 0; block < blocks; block += 1) {
      generated.push({
        id: generated.length + 1,
        day: dayOrder[dayIndex % dayOrder.length],
        time: block === 0 ? "10:00" : "14:00",
        subject: task.course,
        duration: task.priority === "High" ? 50 : 25
      });
      dayIndex += 1;
    }
  });

  return generated;
}

function renderCalendarCell(day, hour) {
  const sessions = state.sessions
    .filter((session) => session.day === day && Number(session.time.slice(0, 2)) === hour)
    .sort((a, b) => a.time.localeCompare(b.time));

  return `
    <div class="calendar-cell" data-day="${day}" data-hour="${hour}" aria-label="${day} at ${formatHour(hour)}">
      ${
        sessions.length
          ? sessions.map(renderSessionCard).join("")
          : `<span class="empty-slot">Open</span>`
      }
    </div>
  `;
}

function renderSessionCard(session) {
  const duration = Number(session.duration) || 25;
  const sessionHeight = getSessionHeight(duration);

  return `
    <article class="session-card calendar-session" draggable="true" data-session-id="${session.id}" style="--session-height: ${sessionHeight}rem;">
      <div class="session-card-header">
        <h3>${escapeHTML(session.subject)}</h3>
        <div class="session-card-actions">
          <span class="drag-hint" aria-hidden="true">Drag</span>
          <button class="session-delete" type="button" data-delete-session aria-label="Delete ${escapeHTML(session.subject)} session">Delete</button>
        </div>
      </div>
      <p class="meta">${formatTime(session.time)} · ${duration} min</p>
      <div class="session-controls" aria-label="Adjust ${escapeHTML(session.subject)} session">
        <label>
          <span>Day</span>
          <select data-session-field="day">
            ${dayOrder
              .map((day) => `<option value="${day}" ${session.day === day ? "selected" : ""}>${day.slice(0, 3)}</option>`)
              .join("")}
          </select>
        </label>
        <label>
          <span>Time</span>
          <input data-session-field="time" type="time" value="${session.time}" />
        </label>
        <label>
          <span>Min</span>
          <select data-session-field="duration">
            ${[25, 50, 75, 90, 120]
              .map(
                (duration) =>
                  `<option value="${duration}" ${Number(session.duration) === duration ? "selected" : ""}>${duration}</option>`
              )
              .join("")}
          </select>
        </label>
      </div>
    </article>
  `;
}

function setupCalendarInteractions(container) {
  container.querySelectorAll(".calendar-session").forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", card.dataset.sessionId);
      event.dataTransfer.effectAllowed = "move";
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
    });
  });

  container.querySelectorAll(".calendar-cell").forEach((cell) => {
    cell.addEventListener("dragover", (event) => {
      event.preventDefault();
      cell.classList.add("drop-target");
    });

    cell.addEventListener("dragleave", () => {
      cell.classList.remove("drop-target");
    });

    cell.addEventListener("drop", async (event) => {
      event.preventDefault();
      cell.classList.remove("drop-target");
      const id = Number(event.dataTransfer.getData("text/plain"));
      await updateSession(id, {
        day: cell.dataset.day,
        time: `${String(cell.dataset.hour).padStart(2, "0")}:00`
      });
    });
  });

  container.querySelectorAll("[data-session-field]").forEach((field) => {
    field.addEventListener("change", async (event) => {
      const card = event.target.closest(".calendar-session");
      const id = Number(card.dataset.sessionId);
      const value = event.target.dataset.sessionField === "duration" ? Number(event.target.value) : event.target.value;
      await updateSession(id, {
        [event.target.dataset.sessionField]: value
      });
    });
  });

  container.querySelectorAll("[data-delete-session]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const card = event.target.closest(".calendar-session");
      await deleteSession(Number(card.dataset.sessionId));
    });
  });
}

async function updateSession(id, updates) {
  const sessions = state.sessions.map((session) => (Number(session.id) === id ? { ...session, ...updates } : session));
  await replaceSessions(sessions);
  renderWeekPlan();
}

async function deleteSession(id) {
  const sessions = state.sessions.filter((session) => Number(session.id) !== id);
  await replaceSessions(sessions);
  renderWeekPlan();
}

function formatHour(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour} ${suffix}`;
}

function getCalendarHours() {
  const sessionHours = state.sessions
    .map((session) => Number(session.time?.slice(0, 2)))
    .filter((hour) => Number.isInteger(hour) && hour >= 0 && hour <= 23);

  return [...new Set([...defaultCalendarHours, ...sessionHours])].sort((a, b) => a - b);
}

function getSessionHeight(duration) {
  return Math.min(20, Math.max(11.75, 10 + duration * 0.07)).toFixed(2);
}
