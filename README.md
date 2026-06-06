# StudyFlow Sprint 1 Prototype

StudyFlow is a smart study planner for organizing academic tasks, generating study sessions, and visualizing productivity.

## Sprint 1 scope

- Multi-page frontend: dashboard, tasks, planner, analytics, and student login.
- Mock data loaded with `fetch()` from `frontend/data/mock-data.json`.
- Student-specific task/session persistence with `localStorage` until backend auth is connected.
- Task creation, completion toggles, deletion, filtering, and local persistence.
- Generated weekly study plan plus manual study session creation.
- Productivity analytics built with plain HTML, CSS, and JavaScript.
- Responsive layouts, keyboard navigation support, visible focus states, semantic sections, labels, and ARIA attributes.

## Run locally

From this project folder:

```bash
python3 -m http.server 8001
```

Then open:

```text
http://127.0.0.1:8001/frontend/
```

Use a local server instead of opening the HTML file directly because the app fetches mock JSON.

## Project structure

- `frontend/pages/` contains all app HTML pages.
- `frontend/css/` contains the CSS entrypoint and split style modules.
- `frontend/js/` contains the JavaScript entrypoint and split behavior modules.
- `frontend/data/` contains Sprint 1 mock JSON.

## Demo path

1. Start on Login, create a local account with your name and email, then sign in.
2. Open the dashboard and explain the core vision: one place for deadlines, study planning, and progress.
3. Add a quick task and show the priority queue and metrics updating.
4. Open Tasks, filter open/completed tasks, complete a task, and delete a test task.
5. Open Planner, regenerate the schedule, and add a manual study session.
6. Open Analytics and explain the focus chart, completion donut, course workload, and risk insight.

## Sprint 2 plan

- Replace mock JSON/localStorage with a custom REST API.
- Store tasks, study sessions, and focus logs in a database.
- Add form POST requests to the backend and handle HTTP errors in the UI.
- Improve scheduler logic using deadlines, estimated hours, and available study windows.
- Add final deployment instructions and polish based on TA/peer feedback.
