-- =============================================
-- FIX DATA PERSISTENCE FOR DEMO USE
-- =============================================
-- Run this in your Supabase SQL Editor to fix data persistence issues

-- Temporarily disable RLS to allow data insertion without authentication
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE scans DISABLE ROW LEVEL SECURITY;
ALTER TABLE photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- Optional: Make user_id nullable for development (uncomment if needed)
-- ALTER TABLE books ALTER COLUMN user_id DROP NOT NULL;

-- Verify the fix worked
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('books', 'scans', 'photos', 'listings', 'user_settings')
AND schemaname = 'public';
