-- Complete Demo System Cleanup Script (FIXED VERSION)
-- Run this to remove all demo user system components
-- This version handles policy dependencies correctly

-- =============================================
-- 1. REMOVE DEMO USER AND ALL DEMO DATA
-- =============================================

-- Delete demo user and all associated data
DELETE FROM auth.users WHERE email = 'demo@scryvault.com';

-- Clean up any demo data that might remain
DELETE FROM books WHERE is_demo = true;
DELETE FROM scans WHERE is_demo = true;
DELETE FROM photos WHERE is_demo = true;
DELETE FROM listings WHERE is_demo = true;
DELETE FROM user_settings WHERE is_demo = true;
DELETE FROM ebay_tokens WHERE is_demo = true;

-- =============================================
-- 2. DROP ALL DEMO-RELATED POLICIES FIRST
-- =============================================

-- Drop ALL policies that reference is_demo (using CASCADE to handle dependencies)
DROP POLICY IF EXISTS "Books: owner or demo accessible" ON books CASCADE;
DROP POLICY IF EXISTS "Books: insert as owner or demo" ON books CASCADE;
DROP POLICY IF EXISTS "Books: update as owner or demo" ON books CASCADE;
DROP POLICY IF EXISTS "Books: delete as owner or demo" ON books CASCADE;

DROP POLICY IF EXISTS "Photos: owner or demo accessible" ON photos CASCADE;
DROP POLICY IF EXISTS "Photos: insert as owner or demo" ON photos CASCADE;
DROP POLICY IF EXISTS "Photos: update as owner or demo" ON photos CASCADE;
DROP POLICY IF EXISTS "Photos: delete as owner or demo" ON photos CASCADE;

DROP POLICY IF EXISTS "Scans: owner or demo accessible" ON scans CASCADE;
DROP POLICY IF EXISTS "Scans: insert as owner or demo" ON scans CASCADE;

-- Drop any remaining policies that might reference is_demo
DROP POLICY IF EXISTS "Listings: owner or demo accessible" ON listings CASCADE;
DROP POLICY IF EXISTS "Listings: insert as owner or demo" ON listings CASCADE;
DROP POLICY IF EXISTS "Listings: update as owner or demo" ON listings CASCADE;
DROP POLICY IF EXISTS "Listings: delete as owner or demo" ON listings CASCADE;

DROP POLICY IF EXISTS "User settings: owner or demo accessible" ON user_settings CASCADE;
DROP POLICY IF EXISTS "User settings: insert as owner or demo" ON user_settings CASCADE;
DROP POLICY IF EXISTS "User settings: update as owner or demo" ON user_settings CASCADE;
DROP POLICY IF EXISTS "User settings: delete as owner or demo" ON user_settings CASCADE;

DROP POLICY IF EXISTS "Ebay tokens: owner or demo accessible" ON ebay_tokens CASCADE;
DROP POLICY IF EXISTS "Ebay tokens: insert as owner or demo" ON ebay_tokens CASCADE;
DROP POLICY IF EXISTS "Ebay tokens: update as owner or demo" ON ebay_tokens CASCADE;
DROP POLICY IF EXISTS "Ebay tokens: delete as owner or demo" ON ebay_tokens CASCADE;

-- Drop other demo-related policies
DROP POLICY IF EXISTS "Users can view their own books or demo books" ON books CASCADE;
DROP POLICY IF EXISTS "Users can insert their own books or demo books" ON books CASCADE;
DROP POLICY IF EXISTS "Users can update their own books or demo books" ON books CASCADE;
DROP POLICY IF EXISTS "Users can delete their own books or demo books" ON books CASCADE;

DROP POLICY IF EXISTS "Users can view their own scans or demo scans" ON scans CASCADE;
DROP POLICY IF EXISTS "Users can insert their own scans or demo scans" ON scans CASCADE;

DROP POLICY IF EXISTS "Users can view photos of their books or demo books" ON photos CASCADE;
DROP POLICY IF EXISTS "Users can insert photos for their books or demo books" ON photos CASCADE;
DROP POLICY IF EXISTS "Users can update photos of their books or demo books" ON photos CASCADE;
DROP POLICY IF EXISTS "Users can delete photos of their books or demo books" ON photos CASCADE;

DROP POLICY IF EXISTS "Users can view their own listings or demo listings" ON listings CASCADE;
DROP POLICY IF EXISTS "Users can insert their own listings or demo listings" ON listings CASCADE;
DROP POLICY IF EXISTS "Users can update their own listings or demo listings" ON listings CASCADE;

DROP POLICY IF EXISTS "Users can manage their own settings or demo settings" ON user_settings CASCADE;
DROP POLICY IF EXISTS "Users can manage their own ebay tokens or demo tokens" ON ebay_tokens CASCADE;

-- =============================================
-- 3. DROP DEMO-RELATED INDEXES
-- =============================================

DROP INDEX IF EXISTS idx_books_is_demo;
DROP INDEX IF EXISTS idx_scans_is_demo;
DROP INDEX IF EXISTS idx_photos_is_demo;
DROP INDEX IF EXISTS idx_listings_is_demo;
DROP INDEX IF EXISTS idx_user_settings_is_demo;
DROP INDEX IF EXISTS idx_ebay_tokens_is_demo;

-- =============================================
-- 4. NOW REMOVE is_demo COLUMNS (after policies are dropped)
-- =============================================

-- Remove is_demo columns completely
ALTER TABLE books DROP COLUMN IF EXISTS is_demo;
ALTER TABLE scans DROP COLUMN IF EXISTS is_demo;
ALTER TABLE photos DROP COLUMN IF EXISTS is_demo;
ALTER TABLE listings DROP COLUMN IF EXISTS is_demo;
ALTER TABLE user_settings DROP COLUMN IF EXISTS is_demo;
ALTER TABLE ebay_tokens DROP COLUMN IF EXISTS is_demo;

-- =============================================
-- 5. RECREATE CLEAN POLICIES (NO DEMO REFERENCES)
-- =============================================

-- Books policies
CREATE POLICY "Users can view their own books" ON books FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own books" ON books FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own books" ON books FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own books" ON books FOR DELETE USING (auth.uid() = user_id);

-- Scans policies
CREATE POLICY "Users can view their own scans" ON scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scans" ON scans FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Photos policies
CREATE POLICY "Users can view photos of their books" ON photos FOR SELECT USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = photos.book_id AND books.user_id = auth.uid())
);
CREATE POLICY "Users can insert photos for their books" ON photos FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM books WHERE books.id = photos.book_id AND books.user_id = auth.uid())
);
CREATE POLICY "Users can update photos of their books" ON photos FOR UPDATE USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = photos.book_id AND books.user_id = auth.uid())
);
CREATE POLICY "Users can delete photos of their books" ON photos FOR DELETE USING (
    EXISTS (SELECT 1 FROM books WHERE books.id = photos.book_id AND books.user_id = auth.uid())
);

-- Listings policies
CREATE POLICY "Users can view their own listings" ON listings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own listings" ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own listings" ON listings FOR UPDATE USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view their own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Ebay tokens policies
CREATE POLICY "Users can manage their own ebay tokens" ON ebay_tokens
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 6. VERIFY CLEANUP
-- =============================================

-- Check that is_demo columns are gone
SELECT 
    table_name,
    column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND column_name = 'is_demo'
    AND table_name IN ('books', 'scans', 'photos', 'listings', 'user_settings', 'ebay_tokens');

-- Should return no rows if cleanup was successful

SELECT 'Demo system cleanup completed successfully!' as status;
