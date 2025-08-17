-- Plan
INSERT INTO plans (name, description) VALUES
('Gianni 7-Day Base', 'Weekly base structure for strength + running (easy runs, intervals, long run)')
ON CONFLICT DO NOTHING;

-- Grab plan id
WITH p AS (SELECT id FROM plans WHERE name='Gianni 7-Day Base' LIMIT 1)

-- Days
INSERT INTO plan_days (plan_id, day_number, name, focus)
SELECT p.id, 1, 'Monday', 'Easy Run & Lower Body' FROM p
ON CONFLICT DO NOTHING;
INSERT INTO plan_days (plan_id, day_number, name, focus)
SELECT p.id, 2, 'Tuesday', 'Upper Body' FROM p
ON CONFLICT DO NOTHING;
INSERT INTO plan_days (plan_id, day_number, name, focus)
SELECT p.id, 3, 'Wednesday', 'Tempo/Intervals' FROM p
ON CONFLICT DO NOTHING;
INSERT INTO plan_days (plan_id, day_number, name, focus)
SELECT p.id, 4, 'Thursday', 'Upper Body Push' FROM p
ON CONFLICT DO NOTHING;
INSERT INTO plan_days (plan_id, day_number, name, focus)
SELECT p.id, 5, 'Friday', 'Upper Body Pull & Easy Run' FROM p
ON CONFLICT DO NOTHING;
INSERT INTO plan_days (plan_id, day_number, name, focus)
SELECT p.id, 6, 'Saturday', 'Long Run' FROM p
ON CONFLICT DO NOTHING;
INSERT INTO plan_days (plan_id, day_number, name, focus)
SELECT p.id, 7, 'Sunday', 'Rest' FROM p
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

-- Map exercises to days with rough order and PDF notes
WITH d AS (SELECT id, day_number FROM plan_days),
     e AS (SELECT id, name FROM exercises)

-- Monday: Easy run + Lower body
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT (SELECT id FROM d WHERE day_number=1),
       (SELECT id FROM e WHERE name='Easy Run 30-40min'),
       1,
       'RPE 2-3, conversational pace (30-40min)'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=1),
       (SELECT id FROM e WHERE name='Back Squat'), 2, '4x6 (180s rest)'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=1),
       (SELECT id FROM e WHERE name='Romanian Deadlift'), 3, '3x8 (120s)'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=1),
       (SELECT id FROM e WHERE name='Bulgarian Split Squat'), 4, '3x8 each leg (120s)'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=1),
       (SELECT id FROM e WHERE name='DB Walking Lunge'), 5, '3x20 alternating (120s)'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=1),
       (SELECT id FROM e WHERE name='Hanging Leg/Knee Raises'), 6, '3 x max reps + 12x calf raises (superset)';

-- Tuesday: Upper body
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT (SELECT id FROM d WHERE day_number=2),(SELECT id FROM e WHERE name='Bench Press'),1,'4x6 (180s)'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=2),(SELECT id FROM e WHERE name='Bent Over Row'),2,'4x8 (180s)'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=2),(SELECT id FROM e WHERE name='Pull Ups / Muscle Ups'),3,'5x5 weighted if possible (180s)'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=2),(SELECT id FROM e WHERE name='Handstand Push Up / Pike Push Up'),4,'5x5 (180s)'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=2),(SELECT id FROM e WHERE name='Dips'),5,'Finisher 5 rounds: 6 dips, 6 pull ups, 6 push ups'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=2),(SELECT id FROM e WHERE name='Pull Ups / Muscle Ups'),6,'Finisher component'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=2),(SELECT id FROM e WHERE name='Push Ups'),7,'Finisher component';

-- Wednesday: Tempo/Intervals
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT (SELECT id FROM d WHERE day_number=3),(SELECT id FROM e WHERE name='Tempo/Intervals 400m Repeats'),1,
'10min WU, 8x400m @ RPE 7-8 (90s rec), 10min CD. Progress: add reps, increase pace, reduce recovery.';

-- Thursday: Upper Body Push
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT (SELECT id FROM d WHERE day_number=4),(SELECT id FROM e WHERE name='Handstand Push Up / Pike Push Up'),1,'5x5 (180s)'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=4),(SELECT id FROM e WHERE name='Weighted Dip'),2,'4x6-8 (180s)'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=4),(SELECT id FROM e WHERE name='Incline Bench Press'),3,'3x10-12 (90s)'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=4),(SELECT id FROM e WHERE name='Incline DB Flys'),4,'Tri-set 3 rounds'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=4),(SELECT id FROM e WHERE name='Incline DB Squeeze Press'),5,'Tri-set 3 rounds'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=4),(SELECT id FROM e WHERE name='Seated DB Lateral Raises'),6,'Tri-set 3 rounds'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=4),(SELECT id FROM e WHERE name='Close Grip Push Up'),7,'Add as bodyweight burn'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=4),(SELECT id FROM e WHERE name='GHD Sit Ups / Hanging Raises'),8,'3x12 (90s)';

-- Friday: Upper Body Pull (+ optional easy run)
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT (SELECT id FROM d WHERE day_number=5),(SELECT id FROM e WHERE name='Weighted Pull Up'),1,'5x5 (180s)'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=5),(SELECT id FROM e WHERE name='Bent Over Row'),2,'3x10'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=5),(SELECT id FROM e WHERE name='Aussie Pull Up'),3,'3x10 (90s)'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=5),(SELECT id FROM e WHERE name='ISO Pull-Up Holds Circuit'),4,'5 rounds: 5 pull ups + holds + dead hang (90s)'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=5),(SELECT id FROM e WHERE name='KB Gorilla Rows'),5,'3x12'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=5),(SELECT id FROM e WHERE name='Dumbbell Bicep Curl'),6,'3x10'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=5),(SELECT id FROM e WHERE name='GHD Sit Ups / Hanging Raises'),7,'3x12 (90s)'
UNION ALL
SELECT (SELECT id FROM d WHERE day_number=5),(SELECT id FROM e WHERE name='Easy Run 30-40min'),8,'Optional easy run RPE 2-3';

-- Saturday: Long run
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes)
SELECT (SELECT id FROM d WHERE day_number=6),(SELECT id FROM e WHERE name='Long Run 60-90min'),1,'Start ~60min, increase ~10% weekly (cap ~90min). RPE 5-6.';

-- Sunday: Rest (no exercises inserted)
