-- Simple seed that works
DELETE FROM plan_day_exercises;
DELETE FROM exercises WHERE id > 0;
DELETE FROM plan_days WHERE id > 0;
DELETE FROM plans WHERE id > 0;

-- Add plan
INSERT INTO plans (id, name, description) VALUES (1, 'Gianni 7-Day Base', 'Weekly base structure');

-- Add days
INSERT INTO plan_days (id, plan_id, day_number, name, focus, position) VALUES
(1, 1, 1, 'Monday', 'Easy Run & Lower Body', 1),
(2, 1, 2, 'Tuesday', 'Upper Body', 2),
(3, 1, 3, 'Wednesday', 'Tempo/Intervals', 3),
(4, 1, 4, 'Thursday', 'Upper Body Push', 4),
(5, 1, 5, 'Friday', 'Upper Body Pull & Easy Run', 5),
(6, 1, 6, 'Saturday', 'Long Run', 6),
(7, 1, 7, 'Sunday', 'Rest', 7);

-- Add exercises
INSERT INTO exercises (id, name, modality) VALUES
(1, 'Back Squat', 'strength'),
(2, 'Romanian Deadlift', 'strength'),
(3, 'Bench Press', 'strength'),
(4, 'Bent Over Row', 'strength'),
(5, 'Pull Ups', 'bodyweight'),
(6, 'Tempo Run 400m Repeats', 'run'),
(7, 'Weighted Dip', 'strength'),
(8, 'Incline Bench Press', 'strength'),
(9, 'Weighted Pull Up', 'strength'),
(10, 'Easy Run 30-40min', 'run'),
(11, 'Long Run 60-90min', 'run');

-- Add exercises to days
INSERT INTO plan_day_exercises (plan_day_id, exercise_id, order_index, notes) VALUES
-- Monday
(1, 10, 1, 'RPE 2-3, conversational pace'),
(1, 1, 2, '4x6 (180s rest)'),
(1, 2, 3, '3x8 (120s)'),
-- Tuesday  
(2, 3, 1, '4x6 (180s)'),
(2, 4, 2, '4x8 (180s)'),
(2, 5, 3, '5x5 (180s)'),
-- Wednesday
(3, 6, 1, '8x400m @ RPE 7-8 (90s rest)'),
-- Thursday
(4, 7, 1, '4x6 (180s)'),
(4, 8, 2, '4x8 (180s)'),
-- Friday
(5, 9, 1, '4x6 (180s)'),
(5, 4, 2, '3x10'),
(5, 10, 3, 'Optional easy run'),
-- Saturday
(6, 11, 1, 'RPE 5-6, build endurance');
-- Sunday has no exercises (rest day)
