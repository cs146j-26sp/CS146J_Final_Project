import { nextId } from "./utils.js";

const STORAGE_KEY = "studyflow-beta-state-v2";
const AUTH_KEY = "studyflow-active-student";
const ACCOUNT_KEY = "studyflow-local-accounts";

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
      name: student.name.trim(),
      email: student.email.trim().toLowerCase()
    })
  );
}

export function getSavedStudents() {
  const saved = localStorage.getItem(ACCOUNT_KEY);
  const students = saved ? parseSavedJSON(saved) : [];
  return Array.isArray(students) ? students : [];
}

export function findSavedStudent(email) {
  return getSavedStudents().find((student) => student.email === email.trim().toLowerCase()) || null;
}

export function saveStudentAccount(student) {
  const nextStudent = {
    name: student.name.trim(),
    email: student.email.trim().toLowerCase()
  };
  const students = getSavedStudents();
  const existingIndex = students.findIndex((savedStudent) => savedStudent.email === nextStudent.email);

  if (existingIndex >= 0) {
    students[existingIndex] = nextStudent;
  } else {
    students.push(nextStudent);
  }

  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(students));
  return nextStudent;
}

export function clearActiveStudent() {
  localStorage.removeItem(AUTH_KEY);
}

export async function loadState() {
  const saved = localStorage.getItem(getStorageKey());
  const savedData = saved ? parseSavedJSON(saved) : null;
  const data = savedData?.tasks?.length ? savedData : await fetchMockData();

  Object.assign(state, data);

  if (!savedData?.tasks?.length) {
    saveState();
  }
}

export function saveState() {
  localStorage.setItem(getStorageKey(), JSON.stringify(state));
}

export function addTask(task) {
  state.tasks.push({
    id: nextId(state.tasks),
    ...task
  });
  saveState();
}

export function toggleTask(id) {
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

export function sortedTasks() {
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
