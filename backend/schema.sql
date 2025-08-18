-- Basic schema for plans, days, exercises, and logs
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS plan_days (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL, -- 1..7
  name TEXT NOT NULL,          -- Monday, Tuesday, etc.
  focus TEXT                   -- e.g., Lower Body, Upper Body
);

CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  modality TEXT CHECK (modality IN ('strength','run','bodyweight','mobility')) DEFAULT 'strength'
);

CREATE TABLE IF NOT EXISTS plan_day_exercises (
  id SERIAL PRIMARY KEY,
  plan_day_id INTEGER REFERENCES plan_days(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  plan_day_id INTEGER REFERENCES plan_days(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS log_sets (
  id SERIAL PRIMARY KEY,
  log_id INTEGER REFERENCES logs(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE SET NULL,
  set_number INTEGER,
  weight NUMERIC,     -- kg
  reps INTEGER,
  rpe NUMERIC,
  distance_m INTEGER, -- meters
  duration_sec INTEGER,
  notes TEXT
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_logs_day ON logs(plan_day_id);
CREATE INDEX IF NOT EXISTS idx_logsets_ex ON log_sets(exercise_id);

-- Ordering support for plan days
ALTER TABLE plan_days ADD COLUMN IF NOT EXISTS position INTEGER;
UPDATE plan_days SET position = day_number WHERE position IS NULL;

-- Users for per-user logs and settings
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Scope logs to users (nullable to keep compatibility)
ALTER TABLE logs ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_logs_user ON logs(user_id);
