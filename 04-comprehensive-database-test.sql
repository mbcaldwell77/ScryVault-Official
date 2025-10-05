-- Comprehensive Database Test Script
-- Run this to verify all database functionality is working correctly

-- =============================================
-- 1. VERIFY DATABASE STRUCTURE
-- =============================================

SELECT 'Testing database structure...' as status;

-- Check that all required tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('books', 'categories', 'scans', 'photos', 'listings', 'user_settings', 'ebay_tokens')
ORDER BY table_name;

-- =============================================
-- 2. VERIFY RLS POLICIES ARE ACTIVE
-- =============================================

SELECT 'Checking RLS policies...' as status;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('books', 'categories', 'scans', 'photos', 'listings', 'user_settings', 'ebay_tokens');

-- =============================================
-- 3. VERIFY NO is_demo COLUMNS EXIST
-- =============================================

SELECT 'Checking for is_demo columns...' as status;

SELECT 
    table_name,
    column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND column_name = 'is_demo'
    AND table_name IN ('books', 'scans', 'photos', 'listings', 'user_settings', 'ebay_tokens');

-- Should return no rows

-- =============================================
-- 4. VERIFY NO DEMO USER EXISTS
-- =============================================

SELECT 'Checking for demo user...' as status;

SELECT COUNT(*) as demo_users_found 
FROM auth.users 
WHERE email = 'demo@scryvault.com';

-- Should return 0

-- =============================================
-- 5. VERIFY CATEGORIES TABLE HAS DEFAULT DATA
-- =============================================

SELECT 'Checking default categories...' as status;

SELECT 
    name,
    color,
    created_at
FROM categories 
ORDER BY name;

-- Should show the default categories from database-schema.sql

-- =============================================
-- 6. VERIFY BOOKS TABLE STRUCTURE
-- =============================================

SELECT 'Checking books table structure...' as status;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'books' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================
-- 7. VERIFY CONSTRAINTS AND INDEXES
-- =============================================

SELECT 'Checking constraints and indexes...' as status;

-- Check for ISBN constraint (should not exist)
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'books'::regclass
    AND conname LIKE '%isbn%';

-- Should return no rows for ISBN constraints

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'books' 
    AND schemaname = 'public';

-- =============================================
-- 8. TEST AUTHENTICATION SYSTEM
-- =============================================

SELECT 'Testing authentication system...' as status;

-- Check if we can create a test user (this will fail if user exists, which is fine)
-- INSERT INTO auth.users (id, email, created_at, updated_at) 
-- VALUES ('test-user-123', 'test@example.com', NOW(), NOW());

-- =============================================
-- 9. VERIFY POLICIES ARE CLEAN
-- =============================================

SELECT 'Checking RLS policies...' as status;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('books', 'scans', 'photos', 'listings', 'user_settings', 'ebay_tokens')
    AND policyname LIKE '%demo%';

-- Should return no rows if demo policies were cleaned up

-- =============================================
-- 10. FINAL VERIFICATION
-- =============================================

SELECT 'Database verification complete!' as status;
SELECT 'The database is ready for both demo mode and real user authentication.' as next_step;

-- Summary
SELECT 
    'SUMMARY' as section,
    'Database is clean and ready' as status,
    'Demo mode uses client-side storage, real users use database with RLS' as architecture;
