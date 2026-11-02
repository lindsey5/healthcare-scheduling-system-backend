# Backend containers

The API and email worker are separate containers built from the same
`Dockerfile`. Both connect to the PostgreSQL database configured by `DB_URI`.
The worker polls the `email_jobs` table, retries failed deliveries with
exponential backoff, and marks jobs failed after the configured attempt limit.

Set the required backend environment variables in `backend/.env`, including
`DB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `BREVO_API_KEY`,
`EMAIL_USER`, and `FRONTEND_URL`. Do not put `.env` in the Docker image.

Apply database migrations before starting the containers:

```powershell
npx sequelize-cli db:migrate --config config/config.js --migrations-path migrations --env production
```

From the `backend` directory, build and start both services:

```powershell
docker compose up --build
```

The API listens on port `3000`. To tune worker polling or retries, set
`EMAIL_WORKER_POLL_INTERVAL_MS` or `EMAIL_WORKER_MAX_ATTEMPTS` in `.env`.
