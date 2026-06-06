import { sortedTasks, state } from "./store.js";
import { escapeHTML, formatDate } from "./utils.js";

export function setupAssistant() {
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
