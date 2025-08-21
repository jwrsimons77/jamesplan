-- Week 1 Exercise Definitions
-- Add all exercises for Week 1

-- Tempo/Intervals exercises
INSERT INTO exercises (name, modality) VALUES
('Warm-up Jog', 'run'),
('400m Intervals', 'run'),
('Cool-down Jog', 'run'),

-- Upper Body Push exercises  
('Handstand Push Ups', 'bodyweight'),
('Pike Push Ups', 'bodyweight'),
('Weighted Dips', 'strength'),
('Incline Bench Press', 'strength'),
('Incline DB Flys', 'strength'),
('Incline DB Squeeze Press', 'strength'),
('Seated DB Lateral Raises', 'strength'),
('Close Grip Push Ups', 'bodyweight'),
('GHD Sit Ups', 'bodyweight'),
('Hanging Knee Raises', 'bodyweight'),
('Hanging Leg Raises', 'bodyweight'),

-- Upper Body Pull exercises
('Weighted Pull Ups', 'bodyweight'),
('Barbell Bent Over Rows', 'strength'),
('Aussie Pull Ups', 'bodyweight'),
('Pull Ups', 'bodyweight'),
('Chin Over Bar Hold', 'bodyweight'),
('Forehead to Bar Hold', 'bodyweight'),
('Head Below Bar Hold', 'bodyweight'),
('Dead Hang', 'bodyweight'),
('KB Gorilla Rows', 'strength'),
('DB Bicep Curls', 'strength'),
('Easy Recovery Run', 'run'),

-- Long Run
('Long Run', 'run'),

-- Lower Body exercises
('Back Squat', 'strength'),
('Romanian Deadlift', 'strength'),
('Bulgarian Split Squats', 'strength'),
('DB Walking Lunges', 'strength'),
('Calf Raises', 'strength'),

-- Upper Body (Tuesday) exercises
('Bench Press', 'strength'),
('Bent Over Row', 'strength'),
('Muscle Ups', 'bodyweight'),
('Dips', 'bodyweight'),
('Push Ups', 'bodyweight');

-- Get exercise IDs for reference
SELECT id, name, modality FROM exercises WHERE id >= 58 ORDER BY id;
