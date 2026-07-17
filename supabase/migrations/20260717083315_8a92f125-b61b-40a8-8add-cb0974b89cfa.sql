
-- 1. Add 'user' role for viewers
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'user';
