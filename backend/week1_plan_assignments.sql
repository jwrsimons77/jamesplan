-- Week 1 Plan Day Exercise Assignments
-- Wed 27 Aug - Tempo/Intervals (plan_day_id = 27)
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes) VALUES
(27, 58, 1, '10 min warm-up jog'),
(27, 59, 2, '8 x 400m @ RPE 7–8 (90s recovery)'),
(27, 60, 3, '10 min cool-down jog');

-- Thu 28 Aug - Upper Body Push (plan_day_id = 28)
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes) VALUES
(28, 61, 1, '5 x 5 Handstand Push Ups (180s rest) - or Pike Push Ups'),
(28, 63, 2, '4 x 6–8 Weighted Dips (180s)'),
(28, 64, 3, '3 x 10–12 Incline Bench Press (90s)'),
(28, 65, 4, 'Superset: 8 Incline DB Flys (3 rounds, 90s rest)'),
(28, 66, 5, 'Superset: 8 Incline DB Squeeze Press'),
(28, 67, 6, 'Superset: 8 Seated DB Lateral Raises'),
(28, 68, 7, 'Superset: 8 Close Grip Push Ups'),
(28, 69, 8, '3 x 12 GHD Sit Ups or Hanging Knee/Leg Raises (90s)');

-- Fri 29 Aug - Upper Body Pull & Easy Run (plan_day_id = 29)
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes) VALUES
(29, 72, 1, '5 x 5 Weighted Pull Ups (180s)'),
(29, 73, 2, '3 sets: 10 Barbell Bent Over Rows (90s)'),
(29, 74, 3, '3 sets: 10 Aussie Pull Ups (90s)'),
(29, 75, 4, 'Iso Superset x5 (90s): 5 Pull Ups'),
(29, 76, 5, 'Iso Superset: 5s Chin Over Bar Hold'),
(29, 77, 6, 'Iso Superset: 5s Forehead to Bar Hold'),
(29, 78, 7, 'Iso Superset: 5s Head Below Bar Hold'),
(29, 79, 8, 'Iso Superset: 5s Dead Hang'),
(29, 80, 9, '3 x 12 KB Gorilla Rows'),
(29, 81, 10, '3 x 10 DB Bicep Curls'),
(29, 71, 11, '3 x 12 GHD Sit Ups or Hanging Knee/Leg Raises'),
(29, 82, 12, 'Optional: 30–40 min easy run @ RPE 2–3');

-- Sat 30 Aug - Long Run (plan_day_id = 30)
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes) VALUES
(30, 83, 1, '60 min easy run @ RPE 5–6');

-- Sun 31 Aug - Rest / Active Recovery (plan_day_id = 31)
-- No exercises needed for rest day

-- Mon 1 Sep - Lower Body + Easy Run (plan_day_id = 32)
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes) VALUES
(32, 84, 1, '4 x 6 Back Squat (180s)'),
(32, 85, 2, '3 x 8 Romanian Deadlift (120s)'),
(32, 86, 3, '3 x 8 Bulgarian Split Squats each leg (120s)'),
(32, 87, 4, '3 x 20 Alternating DB Walking Lunges (120s)'),
(32, 71, 5, '3 x Max Hanging Leg or Knee Raises'),
(32, 88, 6, '3 x 12 Calf Raises (90s)'),
(32, 82, 7, '30–40 min easy recovery run @ RPE 2–3');

-- Tue 2 Sep - Upper Body (plan_day_id = 33)
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes) VALUES
(33, 89, 1, '4 x 6 Bench Press (180s)'),
(33, 90, 2, '4 x 8 Bent Over Row (180s)'),
(33, 91, 3, '5 x 5 Muscle Ups or Pull Ups (weighted if possible) (180s)'),
(33, 61, 4, '5 x 5 Handstand Push Ups or Pike Push Ups (180s)'),
(33, 92, 5, 'Finisher: 6 Dips (5 rounds, rest as needed)'),
(33, 75, 6, 'Finisher: 6 Pull Ups'),
(33, 93, 7, 'Finisher: 6 Push Ups');

-- Verify Week 1 assignments
SELECT pd.name, pd.focus, e.name as exercise, pde.notes
FROM plan_days pd
JOIN plan_day_exercises pde ON pd.id = pde.plan_day_id  
JOIN exercises e ON pde.exercise_id = e.id
WHERE pd.plan_id = 1 AND pd.position BETWEEN 6 AND 12
ORDER BY pd.position, pde.order_index;
