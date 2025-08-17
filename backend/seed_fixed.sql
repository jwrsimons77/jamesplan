-- Plan
INSERT INTO plans (name, description) VALUES
('Gianni 7-Day Base', 'Weekly base structure for strength + running (easy runs, intervals, long run)')
ON CONFLICT DO NOTHING;

-- Days
INSERT INTO plan_days (plan_id, day_number, name, focus)
SELECT id, 1, 'Monday', 'Easy Run & Lower Body' FROM plans WHERE name='Gianni 7-Day Base'
ON CONFLICT DO NOTHING;

INSERT INTO plan_days (plan_id, day_number, name, focus)
SELECT id, 2, 'Tuesday', 'Upper Body' FROM plans WHERE name='Gianni 7-Day Base'
ON CONFLICT DO NOTHING;

INSERT INTO plan_days (plan_id, day_number, name, focus)
SELECT id, 3, 'Wednesday', 'Tempo/Intervals' FROM plans WHERE name='Gianni 7-Day Base'
ON CONFLICT DO NOTHING;

INSERT INTO plan_days (plan_id, day_number, name, focus)
SELECT id, 4, 'Thursday', 'Upper Body Push' FROM plans WHERE name='Gianni 7-Day Base'
ON CONFLICT DO NOTHING;

INSERT INTO plan_days (plan_id, day_number, name, focus)
SELECT id, 5, 'Friday', 'Upper Body Pull & Easy Run' FROM plans WHERE name='Gianni 7-Day Base'
ON CONFLICT DO NOTHING;

INSERT INTO plan_days (plan_id, day_number, name, focus)
SELECT id, 6, 'Saturday', 'Long Run' FROM plans WHERE name='Gianni 7-Day Base'
ON CONFLICT DO NOTHING;

INSERT INTO plan_days (plan_id, day_number, name, focus)
SELECT id, 7, 'Sunday', 'Rest' FROM plans WHERE name='Gianni 7-Day Base'
ON CONFLICT DO NOTHING;

-- Exercises
INSERT INTO exercises (name, modality) VALUES
('Back Squat', 'strength'),
('Romanian Deadlift', 'strength'),
('Bulgarian Split Squat', 'strength'),
('DB Walking Lunge', 'strength'),
('Hanging Leg/Knee Raises', 'bodyweight'),
('Calf Raises', 'strength'),
('Bench Press', 'strength'),
('Bent Over Row', 'strength'),
('Pull Ups / Muscle Ups', 'bodyweight'),
('Handstand Push Up / Pike Push Up', 'bodyweight'),
('Dips', 'bodyweight'),
('Push Ups', 'bodyweight'),
('Tempo/Intervals 400m Repeats', 'run'),
('Weighted Dip', 'strength'),
('Incline Bench Press', 'strength'),
('Incline DB Flys', 'strength'),
('Incline DB Squeeze Press', 'strength'),
('Seated DB Lateral Raises', 'strength'),
('Close Grip Push Up', 'bodyweight'),
('GHD Sit Ups / Hanging Raises', 'bodyweight'),
('Weighted Pull Up', 'strength'),
('Aussie Pull Up', 'bodyweight'),
('ISO Pull-Up Holds Circuit', 'bodyweight'),
('KB Gorilla Rows', 'strength'),
('Dumbbell Bicep Curl', 'strength'),
('Easy Run 30-40min', 'run'),
('Long Run 60-90min', 'run')
ON CONFLICT DO NOTHING;

-- Monday: Easy run + Lower body
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=1),
  (SELECT id FROM exercises WHERE name='Easy Run 30-40min'),
  1,
  'RPE 2-3, conversational pace (30-40min)'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=1),
  (SELECT id FROM exercises WHERE name='Back Squat'),
  2,
  '4x6 (180s rest)'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=1),
  (SELECT id FROM exercises WHERE name='Romanian Deadlift'),
  3,
  '3x8 (120s)'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=1),
  (SELECT id FROM exercises WHERE name='Bulgarian Split Squat'),
  4,
  '3x8 each leg (120s)'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=1),
  (SELECT id FROM exercises WHERE name='DB Walking Lunge'),
  5,
  '3x20 alternating (120s)'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=1),
  (SELECT id FROM exercises WHERE name='Hanging Leg/Knee Raises'),
  6,
  '3 x max reps + 12x calf raises (superset)'
ON CONFLICT DO NOTHING;

-- Tuesday: Upper body
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=2),
  (SELECT id FROM exercises WHERE name='Bench Press'),
  1,
  '4x6 (180s)'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=2),
  (SELECT id FROM exercises WHERE name='Bent Over Row'),
  2,
  '4x8 (180s)'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=2),
  (SELECT id FROM exercises WHERE name='Pull Ups / Muscle Ups'),
  3,
  '5x5 weighted if possible (180s)'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=2),
  (SELECT id FROM exercises WHERE name='Handstand Push Up / Pike Push Up'),
  4,
  '5x5 (180s)'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=2),
  (SELECT id FROM exercises WHERE name='Dips'),
  5,
  'Finisher 5 rounds: 6 dips, 6 pull ups, 6 push ups'
ON CONFLICT DO NOTHING;

-- Wednesday: Tempo/Intervals
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=3),
  (SELECT id FROM exercises WHERE name='Tempo/Intervals 400m Repeats'),
  1,
  '8-10x 400m at 5k pace, 90s rest between'
ON CONFLICT DO NOTHING;

-- Thursday: Upper Body Push
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=4),
  (SELECT id FROM exercises WHERE name='Weighted Dip'),
  1,
  '4x6 (180s)'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=4),
  (SELECT id FROM exercises WHERE name='Incline Bench Press'),
  2,
  '4x8 (180s)'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=4),
  (SELECT id FROM exercises WHERE name='Incline DB Flys'),
  3,
  '3x12 (120s)'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=4),
  (SELECT id FROM exercises WHERE name='Incline DB Squeeze Press'),
  4,
  '3x12 (120s)'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=4),
  (SELECT id FROM exercises WHERE name='Seated DB Lateral Raises'),
  5,
  '3x15 (90s)'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=4),
  (SELECT id FROM exercises WHERE name='Close Grip Push Up'),
  6,
  '3x max reps'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=4),
  (SELECT id FROM exercises WHERE name='GHD Sit Ups / Hanging Raises'),
  7,
  '3x15'
ON CONFLICT DO NOTHING;

-- Friday: Upper Body Pull & Easy Run
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=5),
  (SELECT id FROM exercises WHERE name='Easy Run 30-40min'),
  1,
  'RPE 2-3, conversational pace'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=5),
  (SELECT id FROM exercises WHERE name='Weighted Pull Up'),
  2,
  '4x6 (180s)'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=5),
  (SELECT id FROM exercises WHERE name='Aussie Pull Up'),
  3,
  '4x8 (120s)'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=5),
  (SELECT id FROM exercises WHERE name='ISO Pull-Up Holds Circuit'),
  4,
  '3 rounds: 10s hold, 5 pull ups, 10s hold'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=5),
  (SELECT id FROM exercises WHERE name='KB Gorilla Rows'),
  5,
  '3x12 each arm (120s)'
ON CONFLICT DO NOTHING;

INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=5),
  (SELECT id FROM exercises WHERE name='Dumbbell Bicep Curl'),
  6,
  '3x12 (90s)'
ON CONFLICT DO NOTHING;

-- Saturday: Long Run
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT 
  (SELECT id FROM plan_days WHERE day_number=6),
  (SELECT id FROM exercises WHERE name='Long Run 60-90min'),
  1,
  'RPE 3-4, build endurance'
ON CONFLICT DO NOTHING;
