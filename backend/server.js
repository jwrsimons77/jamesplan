import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// --------- Plans & Days ---------
// Get plan (single base plan)
app.get('/api/plan', async (req, res) => {
  try {
    const plan = await pool.query('SELECT * FROM plans LIMIT 1');
    if (!plan.rows.length) return res.json(null);
    const planId = plan.rows[0].id;
    const days = await pool.query(
      'SELECT * FROM plan_days WHERE plan_id=$1 ORDER BY COALESCE(position, day_number), day_number',
      [planId]
    );
    res.json({ plan: plan.rows[0], days: days.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load plan' });
  }
});

// Get exercises for a plan day
app.get('/api/plan-days/:dayId/exercises', async (req, res) => {
  try {
    const { dayId } = req.params;
    const q = await pool.query(
      `SELECT e.*, pde.order_index, pde.notes
       FROM plan_day_exercises pde
       JOIN exercises e ON e.id = pde.exercise_id
       WHERE pde.plan_day_id = $1
       ORDER BY pde.order_index ASC`, [dayId]);
    res.json(q.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load exercises' });
  }
});

// Calendar: fetch scheduled dates for a range (inclusive)
app.get('/api/plan/calendar', async (req, res) => {
  try {
    const { from, to } = req.query;
    const plan = await pool.query('SELECT id FROM plans LIMIT 1');
    if (!plan.rows.length) return res.json([]);
    const planId = plan.rows[0].id;
    const q = await pool.query(
      `SELECT scheduled_date, plan_day_id, day_number, week_index
       FROM plan_calendar
       WHERE plan_id=$1 AND ($2::date IS NULL OR scheduled_date >= $2::date)
         AND ($3::date IS NULL OR scheduled_date <= $3::date)
       ORDER BY scheduled_date ASC`,
      [planId, from || null, to || null]
    );
    res.json(q.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load calendar' });
  }
});

// --------- Logs ---------
// Create a workout log header (optional user_id)
app.post('/api/logs', async (req, res) => {
  try {
    const { plan_day_id, date, user_id } = req.body;
    const q = await pool.query(
      `INSERT INTO logs (plan_day_id, date, user_id) VALUES ($1, $2, $3) RETURNING *`,
      [plan_day_id, date, user_id || null]
    );
    res.json(q.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// Add a set to a log
app.post('/api/logs/:logId/sets', async (req, res) => {
  try {
    const { logId } = req.params;
    const { exercise_id, set_number, weight, reps, rpe, distance_m, duration_sec, notes } = req.body;
    const q = await pool.query(
      `INSERT INTO log_sets
       (log_id, exercise_id, set_number, weight, reps, rpe, distance_m, duration_sec, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [logId, exercise_id, set_number, weight, reps, rpe, distance_m, duration_sec, notes]
    );
    res.json(q.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to add set' });
  }
});

// Replace all sets for a specific exercise within a log (idempotent amend)
app.put('/api/logs/:logId/exercises/:exerciseId/sets', async (req, res) => {
  const client = await pool.connect();
  try {
    const { logId, exerciseId } = req.params;
    const { rows } = req.body || {};
    if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows array required' });
    await client.query('BEGIN');
    await client.query('DELETE FROM log_sets WHERE log_id=$1 AND exercise_id=$2', [logId, exerciseId]);
    for (const r of rows) {
      const has = r && (r.weight!=null || r.reps!=null || r.rpe!=null || r.distance_m!=null || r.duration_sec!=null || (r.notes && r.notes.length));
      if (!has) continue;
      await client.query(
        `INSERT INTO log_sets (log_id, exercise_id, set_number, weight, reps, rpe, distance_m, duration_sec, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [logId, exerciseId, r.set_number || null, r.weight || null, r.reps || null, r.rpe || null, r.distance_m || null, r.duration_sec || null, r.notes || null]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Failed to replace sets' });
  } finally {
    client.release();
  }
});

// Fetch existing sets for a log/exercise (for amend/prefill within the same log)
app.get('/api/logs/:logId/exercises/:exerciseId/sets', async (req, res) => {
  try {
    const { logId, exerciseId } = req.params;
    const q = await pool.query(
      `SELECT id, set_number, weight, reps, rpe, distance_m, duration_sec, notes
       FROM log_sets
       WHERE log_id=$1 AND exercise_id=$2
       ORDER BY set_number NULLS LAST, id ASC`,
      [logId, exerciseId]
    );
    res.json(q.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load sets' });
  }
});

// Recent sessions summary for an exercise (one representative set per log)
app.get('/api/recent-sets', async (req, res) => {
  try {
    const { exercise_id, user_id, limit } = req.query;
    if (!exercise_id) return res.status(400).json({ error: 'exercise_id required' });
    const lim = Math.max(1, Math.min(10, Number(limit || 2)));
    const q = await pool.query(
      `WITH ranked AS (
         SELECT l.id AS log_id, l.date,
                ls.set_number, ls.weight, ls.reps, ls.rpe, ls.distance_m, ls.duration_sec, ls.notes,
                ROW_NUMBER() OVER (PARTITION BY l.id ORDER BY ls.set_number DESC, ls.id DESC) AS rn
         FROM logs l
         JOIN log_sets ls ON l.id = ls.log_id
         WHERE ls.exercise_id = $1 AND ($2::int IS NULL OR l.user_id = $2::int)
       )
       SELECT log_id, date, set_number, weight, reps, rpe, distance_m, duration_sec
       FROM ranked
       WHERE rn = 1
       ORDER BY date DESC, log_id DESC
       LIMIT $3`,
      [exercise_id, user_id || null, lim]
    );
    res.json(q.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load recent sets' });
  }
});

// Optional: summarize latest log metrics per plan day, scoped by user_id if provided
app.get('/api/logs/summary', async (req, res) => {
  try {
    const { plan_id, user_id } = req.query;
    if (!plan_id) return res.status(400).json({ error: 'plan_id required' });
    // Find latest log per plan_day_id, then aggregate sets and max weight
    const q = await pool.query(
      `WITH latest AS (
         SELECT l.*,
                ROW_NUMBER() OVER (PARTITION BY l.plan_day_id ORDER BY l.date DESC, l.id DESC) AS rn
         FROM logs l
         JOIN plan_days d ON d.id = l.plan_day_id
         WHERE d.plan_id = $1 AND ($2::int IS NULL OR l.user_id = $2::int)
       )
       SELECT d.id AS plan_day_id,
              COALESCE(COUNT(ls.id) FILTER (WHERE latest.rn = 1), 0) AS sets,
              COALESCE(MAX(ls.weight) FILTER (WHERE latest.rn = 1), NULL) AS max_weight,
              COALESCE(SUM(ls.duration_sec) FILTER (WHERE latest.rn = 1), 0) AS total_duration_sec
       FROM plan_days d
       LEFT JOIN latest ON latest.plan_day_id = d.id AND latest.rn = 1
       LEFT JOIN log_sets ls ON ls.log_id = latest.id
       WHERE d.plan_id = $1
       GROUP BY d.id
       ORDER BY d.id`
      , [plan_id, user_id || null]);
    const map = {};
    for (const row of q.rows) {
      map[row.plan_day_id] = {
        sets: Number(row.sets),
        maxWeight: row.max_weight != null ? Number(row.max_weight) : null,
        totalDurationSec: row.total_duration_sec != null ? Number(row.total_duration_sec) : 0
      };
    }
    res.json(map);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to build summary' });
  }
});

// Fetch logs history (optionally by plan_day_id)
app.get('/api/logs', async (req, res) => {
  try {
    const { plan_day_id } = req.query;
    let rows;
    if (plan_day_id) {
      rows = (await pool.query(
        `SELECT l.* FROM logs l WHERE l.plan_day_id=$1 ORDER BY date DESC`, [plan_day_id]
      )).rows;
    } else {
      rows = (await pool.query(`SELECT * FROM logs ORDER BY date DESC`)).rows;
    }
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Aggregated progress for a lift (e.g., best 1xRM estimate by day)
app.get('/api/progress/strength/:exerciseId', async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const { user_id } = req.query;
    const q = await pool.query(
      `SELECT l.date,
              MAX(CASE WHEN ls.reps IS NOT NULL AND ls.weight IS NOT NULL
                       THEN ls.weight * (1 + ls.reps/30.0) END) AS est_1rm
       FROM logs l
       JOIN log_sets ls ON l.id = ls.log_id
       WHERE ls.exercise_id=$1 AND ($2::int IS NULL OR l.user_id = $2::int)
       GROUP BY l.date
       ORDER BY l.date ASC`, [exerciseId]);
    res.json(q.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to compute progress' });
  }
});

// Aggregated progress for running (e.g., total minutes per week)
app.get('/api/progress/running/weekly', async (req, res) => {
  try {
    const { user_id } = req.query;
    const q = await pool.query(
      `SELECT date_trunc('week', l.date) AS week,
              SUM(ls.duration_sec)/60.0 AS minutes
       FROM logs l
       JOIN log_sets ls ON l.id = ls.log_id
       WHERE ls.duration_sec IS NOT NULL AND ($1::int IS NULL OR l.user_id = $1::int)
       GROUP BY 1
       ORDER BY 1 ASC`,
      [user_id || null]
    );
    res.json(q.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to compute weekly running' });
  }
});

// Last set for a user & exercise (prefill assistance)
app.get('/api/last-set', async (req, res) => {
  try {
    const { user_id, exercise_id } = req.query;
    if (!exercise_id) return res.status(400).json({ error: 'exercise_id required' });
    const q = await pool.query(
      `SELECT ls.*
       FROM log_sets ls
       JOIN logs l ON l.id = ls.log_id
       WHERE ls.exercise_id = $1 AND ($2::int IS NULL OR l.user_id = $2::int)
       ORDER BY l.date DESC, l.id DESC, ls.set_number DESC
       LIMIT 1`,
      [exercise_id, user_id || null]
    );
    res.json(q.rows[0] || null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to get last set' });
  }
});

// Update explicit order of plan days for a plan
app.put('/api/plan/order', async (req, res) => {
  const client = await pool.connect();
  try {
    const { plan_day_ids } = req.body || {};
    if (!Array.isArray(plan_day_ids) || !plan_day_ids.length) {
      return res.status(400).json({ error: 'plan_day_ids array required' });
    }
    await client.query('BEGIN');
    for (let i = 0; i < plan_day_ids.length; i++) {
      await client.query('UPDATE plan_days SET position=$1 WHERE id=$2', [i + 1, plan_day_ids[i]]);
    }
    await client.query('COMMIT');
    const ids = plan_day_ids.map(Number);
    const days = (await client.query(
      'SELECT * FROM plan_days WHERE id = ANY($1) ORDER BY position NULLS LAST, day_number', [ids]
    )).rows;
    res.json({ days });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Failed to update order' });
  } finally {
    client.release();
  }
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on :${port}`));
