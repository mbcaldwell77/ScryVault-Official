-- Cleanup script to remove demo user and is_demo columns
-- Run this after implementing the new endpoint-based demo system

-- 1. Remove demo user if it exists
DELETE FROM auth.users WHERE email = 'demo@scryvault.com';

-- 2. Remove is_demo columns from tables (optional - can keep for future use)
-- Uncomment the lines below if you want to completely remove is_demo columns:

-- ALTER TABLE books DROP COLUMN IF EXISTS is_demo;
-- ALTER TABLE scans DROP COLUMN IF EXISTS is_demo;
-- ALTER TABLE photos DROP COLUMN IF EXISTS is_demo;
-- ALTER TABLE listings DROP COLUMN IF EXISTS is_demo;
-- ALTER TABLE user_settings DROP COLUMN IF EXISTS is_demo;
-- ALTER TABLE ebay_tokens DROP COLUMN IF EXISTS is_demo;

-- 3. Drop demo-related indexes
DROP INDEX IF EXISTS idx_books_is_demo;
DROP INDEX IF EXISTS idx_scans_is_demo;
DROP INDEX IF EXISTS idx_photos_is_demo;
DROP INDEX IF EXISTS idx_listings_is_demo;
DROP INDEX IF EXISTS idx_user_settings_is_demo;
DROP INDEX IF EXISTS idx_ebay_tokens_is_demo;

-- 4. Clean up any demo policies that might reference is_demo
DROP POLICY IF EXISTS "Users can view their own books or demo books" ON books;
DROP POLICY IF EXISTS "Users can insert their own books or demo books" ON books;
DROP POLICY IF EXISTS "Users can update their own books or demo books" ON books;
DROP POLICY IF EXISTS "Users can delete their own books or demo books" ON books;

DROP POLICY IF EXISTS "Users can view their own scans or demo scans" ON scans;
DROP POLICY IF EXISTS "Users can insert their own scans or demo scans" ON scans;

DROP POLICY IF EXISTS "Users can view photos of their books or demo books" ON photos;
DROP POLICY IF EXISTS "Users can insert photos for their books or demo books" ON photos;
DROP POLICY IF EXISTS "Users can update photos of their books or demo books" ON photos;
DROP POLICY IF EXISTS "Users can delete photos of their books or demo books" ON photos;

DROP POLICY IF EXISTS "Users can view their own listings or demo listings" ON listings;
DROP POLICY IF EXISTS "Users can insert their own listings or demo listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings or demo listings" ON listings;

DROP POLICY IF EXISTS "Users can manage their own settings or demo settings" ON user_settings;
DROP POLICY IF EXISTS "Users can manage their own ebay tokens or demo tokens" ON ebay_tokens;

-- 5. Recreate clean policies (without demo references)
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

-- 6. Verify cleanup
SELECT 'Cleanup completed. Demo user removed and policies cleaned up.' as status;
