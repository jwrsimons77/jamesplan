-- Fix Sunday to be Touch Rugby instead of Rest
UPDATE plan_days SET focus = 'Touch Rugby' WHERE id IN (37, 44);

-- Verify the update
SELECT id, name, focus FROM plan_days WHERE id IN (37, 44);
