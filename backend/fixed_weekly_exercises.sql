-- Add regular weekly exercises (positions 6-12)

-- Tuesday - Upper Body (plan_day_id = 39, position = 6)
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes) VALUES
(39, 89, 1, '4 x 6 Bench Press (180s)'),
(39, 90, 2, '4 x 8 Bent Over Row (180s)'),
(39, 91, 3, '5 x 5 Muscle Ups or Pull Ups (weighted if possible) (180s)'),
(39, 61, 4, '5 x 5 Handstand Push Ups or Pike Push Ups (180s)'),
(39, 92, 5, 'Finisher: 6 Dips (5 rounds, rest as needed)'),
(39, 75, 6, 'Finisher: 6 Pull Ups'),
(39, 93, 7, 'Finisher: 6 Push Ups');

-- Wednesday - Tempo/Intervals (plan_day_id = 40, position = 7)
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes) VALUES
(40, 58, 1, '10 min warm-up jog'),
(40, 59, 2, '8 x 400m @ RPE 7–8 (90s recovery)'),
(40, 60, 3, '10 min cool-down jog');

-- Thursday - Upper Body Push (plan_day_id = 41, position = 8)
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes) VALUES
(41, 61, 1, '5 x 5 Handstand Push Ups (180s rest) - or Pike Push Ups'),
(41, 63, 2, '4 x 6–8 Weighted Dips (180s)'),
(41, 64, 3, '3 x 10–12 Incline Bench Press (90s)'),
(41, 65, 4, 'Superset: 8 Incline DB Flys (3 rounds, 90s rest)'),
(41, 66, 5, 'Superset: 8 Incline DB Squeeze Press'),
(41, 67, 6, 'Superset: 8 Seated DB Lateral Raises'),
(41, 68, 7, 'Superset: 8 Close Grip Push Ups'),
(41, 69, 8, '3 x 12 GHD Sit Ups or Hanging Knee/Leg Raises (90s)');

-- Friday - Upper Body Pull & Easy Run (plan_day_id = 42, position = 9)
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes) VALUES
(42, 72, 1, '5 x 5 Weighted Pull Ups (180s)'),
(42, 73, 2, '3 sets: 10 Barbell Bent Over Rows (90s)'),
(42, 74, 3, '3 sets: 10 Aussie Pull Ups (90s)'),
(42, 75, 4, 'Iso Superset x5 (90s): 5 Pull Ups'),
(42, 76, 5, 'Iso Superset: 5s Chin Over Bar Hold'),
(42, 77, 6, 'Iso Superset: 5s Forehead to Bar Hold'),
(42, 78, 7, 'Iso Superset: 5s Head Below Bar Hold'),
(42, 79, 8, 'Iso Superset: 5s Dead Hang'),
(42, 80, 9, '3 x 12 KB Gorilla Rows'),
(42, 81, 10, '3 x 10 DB Bicep Curls'),
(42, 71, 11, '3 x 12 GHD Sit Ups or Hanging Knee/Leg Raises'),
(42, 82, 12, 'Optional: 30–40 min easy run @ RPE 2–3');

-- Saturday - Long Run (plan_day_id = 43, position = 10)
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes) VALUES
(43, 83, 1, '60 min easy run @ RPE 5–6');

-- Sunday - Rest (plan_day_id = 44, position = 11) - no exercises

-- Monday - Easy Run & Lower Body (plan_day_id = 45, position = 12)
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes) VALUES
(45, 84, 1, '4 x 6 Back Squat (180s)'),
(45, 85, 2, '3 x 8 Romanian Deadlift (120s)'),
(45, 86, 3, '3 x 8 Bulgarian Split Squats each leg (120s)'),
(45, 87, 4, '3 x 20 Alternating DB Walking Lunges (120s)'),
(45, 71, 5, '3 x Max Hanging Leg or Knee Raises'),
(45, 88, 6, '3 x 12 Calf Raises (90s)'),
(45, 82, 7, '30–40 min easy recovery run @ RPE 2–3');
