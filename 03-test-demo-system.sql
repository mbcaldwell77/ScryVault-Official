-- Test Demo System Implementation
-- Verify that the new endpoint-based demo system works correctly

-- =============================================
-- 1. VERIFY CLEAN DATABASE STATE
-- =============================================

-- Check that is_demo columns no longer exist
SELECT 'Checking that is_demo columns were removed...' as status;

SELECT 
    table_name,
    column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND column_name = 'is_demo'
    AND table_name IN ('books', 'scans', 'photos', 'listings', 'user_settings', 'ebay_tokens');

-- Should return no rows if cleanup was successful

-- =============================================
-- 2. VERIFY NO DEMO USER EXISTS
-- =============================================

SELECT 'Checking for demo user...' as status;

SELECT COUNT(*) as demo_users_found 
FROM auth.users 
WHERE email = 'demo@scryvault.com';

-- Should return 0 if demo user was removed

-- =============================================
-- 3. VERIFY RLS POLICIES ARE CLEAN
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
-- 4. TEST REGULAR USER OPERATIONS
-- =============================================

-- Create a test user (this will fail if user already exists, which is fine)
-- INSERT INTO auth.users (id, email, created_at, updated_at) 
-- VALUES ('test-user-123', 'test@example.com', NOW(), NOW());

-- Test that regular user operations work
-- (This is just a structural test, won't actually insert data)

SELECT 'Testing table structure for regular operations...' as status;

-- Verify books table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'books' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================
-- 5. FINAL VERIFICATION
-- =============================================

-- Final check: verify is_demo columns are completely gone
SELECT 'Final verification - checking for any remaining is_demo columns...' as status;

SELECT 
    COUNT(*) as remaining_is_demo_columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND column_name = 'is_demo';

-- Should return 0 if cleanup was completely successful

SELECT 'Demo system cleanup and setup verification complete!' as status;
SELECT 'The database is now ready for the endpoint-based demo system.' as next_step;
