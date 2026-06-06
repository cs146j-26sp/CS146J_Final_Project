# StudyFlow Sprint 1 Prototype

StudyFlow is a smart study planner for organizing academic tasks, generating study sessions, and visualizing productivity.

## Sprint 1 scope

- Multi-page frontend: dashboard, tasks, planner, analytics, and student login.
- Express + SQLite backend for students, tasks, planner sessions, and analytics.
- Student login/account creation using name and email only.
- Task creation, completion toggles, deletion, filtering, and local persistence.
- Generated weekly study plan plus manual study session creation.
- Productivity analytics built with plain HTML, CSS, and JavaScript.
- Responsive layouts, keyboard navigation support, visible focus states, semantic sections, labels, and ARIA attributes.

## Run locally

From this project folder:

```bash
npm install
npm start
```

Then open:

```text
http://127.0.0.1:8001/
```

Use the Express server instead of opening the HTML file directly because the app now calls the backend API.

## Project structure

- `backend/` contains the Express API, SQLite schema, and route modules.
- `frontend/pages/` contains all app HTML pages.
- `frontend/css/` contains the CSS entrypoint and split style modules.
- `frontend/js/` contains the JavaScript entrypoint and split behavior modules.
- `backend/studyflow.sqlite` is created locally when the server starts and is ignored by Git.

## Demo path

1. Start on Login, create an account with your name and email, then sign in.
2. Open the dashboard and explain the core vision: one place for deadlines, study planning, and progress.
3. Add a quick task and show the priority queue and metrics updating.
4. Open Tasks, filter open/completed tasks, complete a task, and delete a test task.
5. Open Planner, regenerate the schedule, and add a manual study session.
6. Open Analytics and explain the focus chart, completion donut, course workload, and risk insight.

## Sprint 2 plan

- Improve scheduler logic using deadlines, estimated hours, and available study windows.
- Add final deployment instructions and polish based on TA/peer feedback.
