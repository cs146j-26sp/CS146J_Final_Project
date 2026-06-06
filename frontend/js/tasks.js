import { addTask, saveState, sortedTasks, state, toggleTask } from "./store.js";
import { daysUntil, escapeHTML, formatDate, getActiveFilter, priorityTag } from "./utils.js";

export function renderTaskManager(filter = "all") {
  setupTaskForm();
  setupTaskFilters();
  renderTaskTable(filter);
}

function setupTaskForm() {
  const form = document.querySelector("#taskForm");
  const error = document.querySelector("#taskFormError");

  if (form.dataset.ready === "true") {
    return;
  }

  form.dataset.ready = "true";
  form.querySelector("[data-next-step]").addEventListener("click", () => {
    if (validateTaskStep(1)) {
      setTaskFormStep(2);
      updateTaskPreview();
    }
  });

  form.querySelector("[data-prev-step]").addEventListener("click", () => {
    setTaskFormStep(1);
  });

  form.addEventListener("input", updateTaskPreview);
  form.addEventListener("change", updateTaskPreview);
  updateTaskPreview();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateTaskStep(2)) {
      return;
    }

    const data = new FormData(form);
    addTask({
      title: data.get("title"),
      course: data.get("course"),
      type: data.get("type"),
      dueDate: data.get("dueDate"),
      priority: data.get("priority"),
      hours: Number(data.get("hours")),
      status: "open"
    });
    form.reset();
    form.elements.hours.value = 2;
    error.textContent = "";
    setTaskFormStep(1);
    updateTaskPreview();
    renderTaskTable(getActiveFilter());
  });
}

function setTaskFormStep(step) {
  document.querySelectorAll("[data-step]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.step === String(step));
  });

  document.querySelectorAll("[data-step-dot]").forEach((dot) => {
    dot.classList.toggle("active", Number(dot.dataset.stepDot) <= step);
  });
}

function validateTaskStep(step) {
  const form = document.querySelector("#taskForm");
  const error = document.querySelector("#taskFormError");

  if (step === 1) {
    const basics = [form.elements.title, form.elements.course];
    const missing = basics.find((field) => !field.value.trim());

    if (missing) {
      error.textContent = "Add the basics first.";
      missing.focus();
      return false;
    }
  }

  if (step === 2) {
    const dueDate = form.elements.dueDate.value;
    const hours = Number(form.elements.hours.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!dueDate) {
      error.textContent = "Pick a due date.";
      form.elements.dueDate.focus();
      return false;
    }

    if (new Date(`${dueDate}T00:00:00`) < today) {
      error.textContent = "Due date cannot be in the past.";
      form.elements.dueDate.focus();
      return false;
    }

    if (!hours || hours < 0.5) {
      error.textContent = "Estimate at least 0.5 hours.";
      form.elements.hours.focus();
      return false;
    }
  }

  error.textContent = "";
  return true;
}

function updateTaskPreview() {
  const form = document.querySelector("#taskForm");
  const preview = document.querySelector("#taskPreview");

  if (!form || !preview) {
    return;
  }

  const title = form.elements.title.value.trim() || "Untitled task";
  const course = form.elements.course.value.trim() || "Course TBD";
  const priority = form.elements.priority.value;
  const hours = Number(form.elements.hours.value) || 0;
  const dueDate = form.elements.dueDate.value;
  const daysLeft = dueDate ? daysUntil(dueDate) : null;
  const dailyLoad = daysLeft !== null && daysLeft >= 0 ? hours / Math.max(daysLeft, 1) : 0;
  const risk = getTaskRisk(priority, dailyLoad, daysLeft);

  preview.innerHTML = `
    <strong>${escapeHTML(title)}</strong>
    <span>${escapeHTML(course)} · ${priority} priority</span>
    <span>${dueDate ? `${Math.max(daysLeft, 0)} day${daysLeft === 1 ? "" : "s"} left` : "No deadline yet"}</span>
    <div class="risk-meter" aria-label="Risk level ${risk.label}">
      <span style="width: ${risk.width}%"></span>
    </div>
    <em>${risk.label}: ${risk.message}</em>
  `;
}

function getTaskRisk(priority, dailyLoad, daysLeft) {
  if (daysLeft !== null && daysLeft < 0) {
    return { label: "Blocked", message: "move the due date forward", width: 100 };
  }

  if (priority === "High" || dailyLoad > 2.5) {
    return { label: "High signal", message: "schedule this before lighter work", width: 92 };
  }

  if (dailyLoad > 1 || priority === "Medium") {
    return { label: "Medium signal", message: "one focused block should keep it controlled", width: 58 };
  }

  return { label: "Low signal", message: "safe to batch with smaller tasks", width: 28 };
}

function daysUntil(value) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${value}T00:00:00`);
  return Math.ceil((due - today) / 86400000);
}

function setupTaskFilters() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    if (button.dataset.ready === "true") {
      return;
    }

    button.dataset.ready = "true";
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderTaskTable(button.dataset.filter);
    });
  });
}

function renderTaskTable(filter) {
  const container = document.querySelector("#taskTable");
  let tasks = sortedTasks();

  if (filter === "open") {
    tasks = tasks.filter((task) => task.status !== "completed");
  }

  if (filter === "completed") {
    tasks = tasks.filter((task) => task.status === "completed");
  }

  if (tasks.length === 0) {
    container.innerHTML = `<div class="empty-state">No tasks match this filter yet.</div>`;
    return;
  }

  container.innerHTML = tasks
    .map(
      (task) => `
        <article class="table-row">
          <div>
            <h3>${escapeHTML(task.title)}</h3>
            <p class="meta">${escapeHTML(task.course)} · ${escapeHTML(task.type)} · due ${formatDate(task.dueDate)}</p>
            <div class="tag-row">${priorityTag(task.priority)} <span class="tag">${task.hours}h estimate</span></div>
          </div>
          <p class="meta">${task.status === "completed" ? "Completed" : "Open"}</p>
          <button class="small-action" type="button" data-toggle-task="${task.id}">
            ${task.status === "completed" ? "Reopen" : "Complete"}
          </button>
          <button class="small-action" type="button" data-delete-task="${task.id}">Delete</button>
        </article>
      `
    )
    .join("");

  container.querySelectorAll("[data-toggle-task]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleTask(Number(button.dataset.toggleTask));
      renderTaskTable(getActiveFilter());
    });
  });

  container.querySelectorAll("[data-delete-task]").forEach((button) => {
    button.addEventListener("click", () => {
      state.tasks = state.tasks.filter((task) => task.id !== Number(button.dataset.deleteTask));
      saveState();
      renderTaskTable(getActiveFilter());
    });
  });
}
