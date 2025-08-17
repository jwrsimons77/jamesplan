# Gianni 7‑Day Backend (Railway + Postgres)

Simple Express API with PostgreSQL for storing workouts, sets and progress.

## Deploy on Railway
1. Create a new **Railway** project.
2. Add a **PostgreSQL** plugin (Railway will inject `DATABASE_URL`).
3. Create a new **Service** from this repo (or click "Deploy from GitHub").
4. Set `PORT=8080` in variables (Railway default is fine too).
5. Run migrations & seed once:
   - In Railway > Postgres > Connect > "psql" shell run:
     ```sql
     -- If service container has psql installed:
     -- railway run npm run migrate
     -- railway run npm run seed
     -- OR paste the contents of schema.sql then seed.sql into the SQL console.
     ```

## Local Dev
```bash
cp .env.example .env
# set DATABASE_URL to a local Postgres
npm i
npm run migrate
npm run seed
npm run dev
```

## Frontend (.env)
In the frontend app, set the backend URL for production:

```
# in frontend/.env (or Netlify UI vars)
VITE_API_BASE=https://<your-railway-service>.up.railway.app
```

When deployed on Netlify, set `VITE_API_BASE` in Site settings → Build & deploy → Environment.

## API (quick)
- `GET /api/plan` -> base plan + days
- `GET /api/plan-days/:dayId/exercises` -> ordered exercise list + notes
- `POST /api/logs` `{ plan_day_id, date }` -> create a workout instance
- `POST /api/logs/:logId/sets` -> `{ exercise_id, set_number, weight, reps, rpe, distance_m, duration_sec, notes }`
- `GET /api/logs?plan_day_id=ID` -> history
- `GET /api/progress/strength/:exerciseId` -> (date, est_1rm)
- `GET /api/progress/running/weekly` -> (week, minutes)
 - `PUT /api/plan/order` `{ plan_day_ids:number[] }` -> persist custom order (sets `position`)
 - `GET /api/logs/summary?plan_id=…` -> `{ [plan_day_id]: { sets:number, maxWeight:number|null } }`

## Data Model
See `schema.sql`. You can extend it for multiple users/auth later.
