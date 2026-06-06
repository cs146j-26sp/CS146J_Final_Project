/* Generated from split js/*.js files. Edit modules, then regenerate if needed. */

/* js/utils.js */
function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function formatTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(2026, 4, 26, hour, minute));
}

function nextId(items) {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

function getActiveFilter() {
  return document.querySelector("[data-filter].active")?.dataset.filter || "all";
}

function priorityTag(priority) {
  return `<span class="tag ${priority.toLowerCase()}">${escapeHTML(priority)}</span>`;
}

function daysUntil(value) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${value}T00:00:00`);
  return Math.ceil((due - today) / 86400000);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });
}

/* js/store.js */
const STORAGE_KEY = "studyflow-beta-state-v2";
const AUTH_KEY = "studyflow-active-student";

const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const state = {
  tasks: [],
  sessions: [],
  focusMinutes: []
};

function getActiveStudent() {
  const saved = localStorage.getItem(AUTH_KEY);
  return saved ? parseSavedJSON(saved) : null;
}

function setActiveStudent(student) {
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      name: student.name.trim(),
      email: student.email.trim().toLowerCase()
    })
  );
}

function clearActiveStudent() {
  localStorage.removeItem(AUTH_KEY);
}

async function loadState() {
  const saved = localStorage.getItem(getStorageKey());
  const savedData = saved ? parseSavedJSON(saved) : null;
  const data = savedData?.tasks?.length ? savedData : await fetchMockData();

  Object.assign(state, data);

  if (!savedData?.tasks?.length) {
    saveState();
  }
}

function saveState() {
  localStorage.setItem(getStorageKey(), JSON.stringify(state));
}

function addTask(task) {
  state.tasks.push({
    id: nextId(state.tasks),
    ...task
  });
  saveState();
}

function toggleTask(id) {
  state.tasks = state.tasks.map((task) =>
    task.id === id
      ? {
          ...task,
          status: task.status === "completed" ? "open" : "completed"
        }
      : task
  );
  saveState();
}

function sortedTasks() {
  return [...state.tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

function getStorageKey() {
  const student = getActiveStudent();
  return student ? `${STORAGE_KEY}:${student.email}` : STORAGE_KEY;
}

function parseSavedJSON(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn("Ignoring invalid saved StudyFlow data.", error);
    return null;
  }
}

async function fetchMockData() {
  try {
    const response = await fetch("../data/mock-data.json");
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.warn("Using built-in mock data fallback.", error);
  }

  return {
    tasks: [
      {
        id: 1,
        title: "Sprint 1 beta prototype",
        course: "CS 146J",
        type: "Project",
        dueDate: "2026-05-26",
        priority: "High",
        hours: 5,
        status: "open"
      },
      {
        id: 2,
        title: "Linear algebra problem set",
        course: "MATH 51",
        type: "Assignment",
        dueDate: "2026-05-28",
        priority: "Medium",
        hours: 3,
        status: "open"
      },
      {
        id: 3,
        title: "Biology midterm review",
        course: "BIO 82",
        type: "Exam",
        dueDate: "2026-05-29",
        priority: "High",
        hours: 4,
        status: "open"
      },
      {
        id: 4,
        title: "Reading response draft",
        course: "PWR 2",
        type: "Reading",
        dueDate: "2026-05-30",
        priority: "Low",
        hours: 1.5,
        status: "completed"
      },
      {
        id: 5,
        title: "Chemistry lab reflection",
        course: "CHEM 31",
        type: "Assignment",
        dueDate: "2026-06-01",
        priority: "Medium",
        hours: 2,
        status: "open"
      }
    ],
    sessions: [
      { id: 1, day: "Monday", time: "09:00", subject: "CS 146J", duration: 75 },
      { id: 2, day: "Tuesday", time: "13:00", subject: "BIO 82", duration: 50 },
      { id: 3, day: "Wednesday", time: "10:30", subject: "MATH 51", duration: 50 },
      { id: 4, day: "Thursday", time: "15:00", subject: "BIO 82", duration: 75 },
      { id: 5, day: "Friday", time: "11:00", subject: "CHEM 31", duration: 25 }
    ],
    focusMinutes: [
      { day: "Mon", minutes: 80 },
      { day: "Tue", minutes: 110 },
      { day: "Wed", minutes: 45 },
      { day: "Thu", minutes: 95 },
      { day: "Fri", minutes: 50 },
      { day: "Sat", minutes: 30 },
      { day: "Sun", minutes: 65 }
    ]
  };
}

/* js/navigation.js */
function setupNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (!toggle || !links) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

/* js/assistant.js */
function setupAssistant() {
  const widget = document.querySelector(".ai-assistant");
  const toggle = document.querySelector(".ai-fab");
  const close = document.querySelector(".ai-close");
  const messages = document.querySelector("#aiMessages");

  if (!widget || !toggle || !messages) {
    return;
  }

  messages.innerHTML = assistantBubble(
    "assistant",
    "I can turn your deadlines into a sharper next move. Pick a prompt."
  );

  toggle.addEventListener("click", () => {
    const isOpen = widget.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  close.addEventListener("click", () => {
    widget.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });

  document.querySelectorAll("[data-ai-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      addAssistantExchange(messages, button.textContent, button.dataset.aiPrompt);
    });
  });

  document.querySelectorAll("[data-ai-chat-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.elements.message;
      const question = input.value.trim();

      if (!question) {
        return;
      }

      addAssistantExchange(messages, question, question);
      input.value = "";
      input.focus();
    });
  });
}

function addAssistantExchange(messages, userText, prompt) {
  messages.insertAdjacentHTML("beforeend", assistantBubble("user", userText));
  messages.insertAdjacentHTML("beforeend", assistantBubble("assistant", getAssistantReply(prompt)));
  messages.scrollTop = messages.scrollHeight;
}

function getAssistantReply(prompt) {
  const text = prompt.toLowerCase();
  const openTasks = sortedTasks().filter((task) => task.status !== "completed");
  const next = openTasks[0];
  const highPriority = openTasks.filter((task) => task.priority === "High");
  const totalHours = openTasks.reduce((sum, task) => sum + Number(task.hours), 0);

  if (!next) {
    return "Clean queue. Add the next deadline and I will rank it.";
  }

  const referencedTask = findReferencedTask(text, openTasks);

  if ((text.includes("after") || text.includes("then")) && referencedTask) {
    const referencedIndex = openTasks.findIndex((task) => task.id === referencedTask.id);
    const followingTask = openTasks[referencedIndex + 1];

    if (!followingTask) {
      return `${referencedTask.title} is currently the last open item in the queue. After that, you can switch to review or add the next deadline.`;
    }

    return `After ${referencedTask.title}, move to ${followingTask.title}. It is due ${formatDate(followingTask.dueDate)} for ${followingTask.course}.`;
  }

  if (prompt === "next" || text.includes("next") || text.includes("start") || text.includes("first")) {
    return `Start with ${next.title}. It is due ${formatDate(next.dueDate)} and has the shortest runway.`;
  }

  if (prompt === "plan" || text.includes("plan") || text.includes("schedule") || text.includes("study")) {
    return `Block ${Math.min(Math.ceil(totalHours), 6)} hours across the next three days. Put ${next.course} first, then split the remaining work into 50-minute sessions.`;
  }

  if (prompt === "risk" || text.includes("risk") || text.includes("urgent") || text.includes("priority")) {
    return `${highPriority.length} high-priority item${highPriority.length === 1 ? "" : "s"} need attention. Biggest risk: ${highPriority[0]?.title || next.title}.`;
  }

  if (text.includes("analytics") || text.includes("progress") || text.includes("minutes")) {
    const focus = state.focusMinutes.reduce((sum, item) => sum + item.minutes, 0);
    return `You have logged ${focus} focus minutes this week. The analytics page breaks that down by day and course load.`;
  }

  if (text.includes("task") || text.includes("deadline") || text.includes("assignment")) {
    return `You have ${openTasks.length} open task${openTasks.length === 1 ? "" : "s"} totaling ${totalHours} estimated hours. The queue is sorted by deadline.`;
  }

  return "Try asking: what should I do next, how should I plan today, what is risky, or how am I doing?";
}

function findReferencedTask(text, tasks) {
  const questionWords = text.split(/\W+/).filter((word) => word.length > 2);

  return tasks.find((task) => {
    const titleWords = task.title
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2);
    const courseWords = task.course.toLowerCase().split(/\W+/).filter((word) => word.length > 1);
    const taskWords = [...titleWords, ...courseWords];

    return taskWords.some((taskWord) =>
      questionWords.some((questionWord) => taskWord.startsWith(questionWord) || questionWord.startsWith(taskWord))
    );
  });
}

function assistantBubble(role, text) {
  return `<div class="ai-message ${role}">${escapeHTML(text)}</div>`;
}

/* js/dashboard.js */
function renderDashboard() {
  renderTodayFocus();
  renderDashboardTasks();
  renderMetrics();
  renderRecommendation();
  setupQuickTaskForm();
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

/* js/tasks.js */
function renderTaskManager(filter = "all") {
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

/* js/planner.js */
function renderPlanner() {
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

/* js/analytics.js */
function renderAnalytics() {
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

/* js/login.js */
const DEMO_CREDENTIALS = {
  name: "Ivy League",
  email: "demo@stanford.edu",
  password: "test123"
};

function setupLoginPage() {
  const form = document.querySelector("#loginForm");
  const status = document.querySelector("#loginStatus");
  const signedInPanel = document.querySelector("#signedInPanel");
  const currentStudent = document.querySelector("#currentStudent");
  const signOut = document.querySelector("#signOutButton");

  if (!form || !status || !signedInPanel || !currentStudent || !signOut) {
    return;
  }

  if (!isApprovedActiveStudent()) {
    clearActiveStudent();
  }

  renderCurrentStudent();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get("name").trim();
    const email = data.get("email").trim().toLowerCase();
    const password = data.get("password");

    if (!isApprovedDemoLogin(name, email, password)) {
      status.textContent = "Use the approved demo credentials to sign in.";
      return;
    }

    setActiveStudent({ name, email });
    status.textContent = "Signed in. Your StudyFlow data now saves to this student profile.";
    form.reset();
    renderCurrentStudent();
    window.location.href = getDashboardPath();
  });

  signOut.addEventListener("click", () => {
    clearActiveStudent();
    status.textContent = "Signed out. Sign in again to load a saved student workspace.";
    renderCurrentStudent();
  });
}

function isApprovedDemoLogin(name, email, password) {
  return (
    name === DEMO_CREDENTIALS.name &&
    email === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password
  );
}

function isApprovedActiveStudent() {
  const student = getActiveStudent();
  return !student || (student.name === DEMO_CREDENTIALS.name && student.email === DEMO_CREDENTIALS.email);
}

function renderCurrentStudent() {
  const student = getActiveStudent();
  const signedInPanel = document.querySelector("#signedInPanel");
  const currentStudent = document.querySelector("#currentStudent");

  signedInPanel.hidden = !student;
  currentStudent.textContent = student ? `${student.name} (${student.email})` : "";
}

function getDashboardPath() {
  return window.location.pathname.endsWith("/pages/login.html") ? "index.html" : "pages/index.html";
}

/* js/app.js */
document.addEventListener("DOMContentLoaded", async () => {
  setupNavigation();

  if (document.body.dataset.page === "login") {
    setupLoginPage();
    return;
  }

  if (requiresLogin() && !isApprovedActiveStudentForApp()) {
    clearActiveStudent();
    window.location.href = "../index.html";
    return;
  }

  await loadState();
  setupAssistant();
  routePage();
});

function requiresLogin() {
  return document.body.dataset.page !== "login";
}

function isApprovedActiveStudentForApp() {
  const student = getActiveStudent();
  return student?.name === "Ivy League" && student?.email === "demo@stanford.edu";
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
