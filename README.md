<p align="center">
  <img src="frontend/assets/studyflow_logo.png" alt="StudyFlow logo" width="96" />
</p>

# StudyFlow

StudyFlow is a smart study planner for organizing academic tasks, generating study sessions, and visualizing productivity.

## Contributors

StudyFlow was built by Isaac Okech and Kelvin Waititu.

## Features

- Student account creation and sign-in.
- Task tracking with priorities and completion status.
- Weekly study planner with generated sessions.
- Productivity analytics and workload summaries.
- Responsive multi-page interface.

## Tech stack

- Frontend: HTML, CSS, JavaScript.
- Backend: Node.js, Express.
- Database: SQLite.
- Deployment: Railway.

## Live app

StudyFlow is deployed on Railway:

```text
https://cs146jfinalproject-production.up.railway.app/
```

Open the link in a browser to use the deployed version. The deployed app uses the backend database, so users should create an account once and then sign in with the exact same name and email on later visits.

## Account usage

1. Open the deployed app.
2. Select **Create account** if this is your first time using StudyFlow.
3. Enter your name and school email.
4. After the account is created, use the **Sign in** tab for future visits.
5. Sign in with the exact same name and email used when the account was created.

If sign-in fails, double-check spelling, capitalization, and the email address. Email addresses are normalized to lowercase, but the name still needs to match the account you created.

## Demo account

Use this account to quickly try the deployed app:

- Name: `titu`
- Email: `titu@stanford.edu`

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

## Deployment note

The deployed app uses Railway with a persistent SQLite database path configured through `DATABASE_PATH`.

## Project structure

- `backend/` contains the Express API, SQLite schema, and route modules.
- `frontend/pages/` contains all app HTML pages.
- `frontend/css/` contains the CSS entrypoint and split style modules.
- `frontend/js/` contains the JavaScript entrypoint and split behavior modules.
- `backend/studyflow.sqlite` is created locally when the server starts and is ignored by Git.

## Demo path

1. Open the Railway deployment and start on Login.
2. Create an account with your name and school email, or sign in with an existing StudyFlow account.
3. Open the dashboard and explain the core vision: one place for deadlines, study planning, and progress.
4. Add a quick task and show the priority queue and metrics updating.
5. Open Tasks, filter open/completed tasks, complete a task, and delete a test task.
6. Open Planner, regenerate the schedule, and add a manual study session.
7. Open Analytics and explain the focus chart, completion donut, course workload, and risk insight.
