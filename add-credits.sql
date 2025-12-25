-- Add credits to your user account
-- Replace 'YOUR_USER_ID_HERE' with your actual Clerk user ID

-- Option 1: If you don't have a UserBalance record yet, create one with 1000 credits
INSERT OR IGNORE INTO UserBalance (userId, credits) 
VALUES ('YOUR_USER_ID_HERE', 1000);

-- Option 2: If you already have a UserBalance record, add 1000 more credits
UPDATE UserBalance 
SET credits = credits + 1000 
WHERE userId = 'YOUR_USER_ID_HERE';

-- To find your user ID, run this query:
SELECT DISTINCT userId FROM Workflow;
