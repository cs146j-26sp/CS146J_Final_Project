import { dayOrder, saveState, sortedTasks, state } from "./store.js";
import { escapeHTML, formatTime, nextId } from "./utils.js";

export function renderPlanner() {
  setupSessionForm();
  document.querySelector("#regeneratePlan").addEventListener("click", () => {
    state.sessions = generateSessionsFromTasks();
    saveState();
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
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    state.sessions.push({
      id: nextId(state.sessions),
      subject: data.get("subject"),
      day: data.get("day"),
      time: data.get("time"),
      duration: Number(data.get("duration"))
    });
    saveState();
    form.reset();
    renderWeekPlan();
  });
}

function renderWeekPlan() {
  const container = document.querySelector("#weekPlan");
  container.innerHTML = dayOrder
    .map((day) => {
      const sessions = state.sessions
        .filter((session) => session.day === day)
        .sort((a, b) => a.time.localeCompare(b.time));

      return `
        <section class="day-column" aria-label="${day}">
          <h3>${day}</h3>
          ${
            sessions.length
              ? sessions
                  .map(
                    (session) => `
                      <article class="session-card">
                        <h3>${escapeHTML(session.subject)}</h3>
                        <p class="meta">${formatTime(session.time)} · ${session.duration} min</p>
                      </article>
                    `
                  )
                  .join("")
              : `<p class="meta">Open study space</p>`
          }
        </section>
      `;
    })
    .join("");
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
