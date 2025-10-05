-- Fix RLS policies to allow demo mode without authenticated user
-- The issue is that auth.uid() returns null when not authenticated,
-- but we need demo data to be accessible

-- Drop existing policies
DROP POLICY IF EXISTS "Books: owner or demo" ON books;
DROP POLICY IF EXISTS "Books: insert only as self or demo" ON books;
DROP POLICY IF EXISTS "Books: update only as owner or demo" ON books;
DROP POLICY IF EXISTS "Books: delete only as owner or demo" ON books;

-- Create new policies that allow demo data when no user is authenticated
CREATE POLICY "Books: owner or demo accessible" ON books FOR SELECT USING (
    (SELECT auth.uid()) = user_id OR is_demo = true
);

CREATE POLICY "Books: insert as owner or demo" ON books FOR INSERT WITH CHECK (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true)
);

CREATE POLICY "Books: update as owner or demo" ON books FOR UPDATE USING (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true)
);

CREATE POLICY "Books: delete as owner or demo" ON books FOR DELETE USING (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true)
);

-- Update scans policies
DROP POLICY IF EXISTS "Scans: owner or demo" ON scans;
DROP POLICY IF EXISTS "Scans: insert only as self or demo" ON scans;

CREATE POLICY "Scans: owner or demo accessible" ON scans FOR SELECT USING (
    (SELECT auth.uid()) = user_id OR is_demo = true
);

CREATE POLICY "Scans: insert as owner or demo" ON scans FOR INSERT WITH CHECK (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true)
);

-- Update photos policies
DROP POLICY IF EXISTS "Photos: owner or demo" ON photos;
DROP POLICY IF EXISTS "Photos: insert only as self or demo" ON photos;
DROP POLICY IF EXISTS "Photos: update only as owner or demo" ON photos;
DROP POLICY IF EXISTS "Photos: delete only as owner or demo" ON photos;

CREATE POLICY "Photos: owner or demo accessible" ON photos FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM books 
        WHERE books.id = photos.book_id 
        AND ((SELECT auth.uid()) = books.user_id OR books.is_demo = true)
    )
);

CREATE POLICY "Photos: insert as owner or demo" ON photos FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM books 
        WHERE books.id = photos.book_id 
        AND (
            ((SELECT auth.uid()) = books.user_id AND books.is_demo = false) OR 
            (books.is_demo = true)
        )
    )
);

CREATE POLICY "Photos: update as owner or demo" ON photos FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM books 
        WHERE books.id = photos.book_id 
        AND (
            ((SELECT auth.uid()) = books.user_id AND books.is_demo = false) OR 
            (books.is_demo = true)
        )
    )
);

CREATE POLICY "Photos: delete as owner or demo" ON photos FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM books 
        WHERE books.id = photos.book_id 
        AND (
            ((SELECT auth.uid()) = books.user_id AND books.is_demo = false) OR 
            (books.is_demo = true)
        )
    )
);

-- Update listings policies
DROP POLICY IF EXISTS "Listings: owner or demo" ON listings;
DROP POLICY IF EXISTS "Listings: insert only as self or demo" ON listings;
DROP POLICY IF EXISTS "Listings: update only as owner or demo" ON listings;
DROP POLICY IF EXISTS "Listings: delete only as owner or demo" ON listings;

CREATE POLICY "Listings: owner or demo accessible" ON listings FOR SELECT USING (
    (SELECT auth.uid()) = user_id OR is_demo = true
);

CREATE POLICY "Listings: insert as owner or demo" ON listings FOR INSERT WITH CHECK (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true)
);

CREATE POLICY "Listings: update as owner or demo" ON listings FOR UPDATE USING (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true)
);

CREATE POLICY "Listings: delete as owner or demo" ON listings FOR DELETE USING (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true)
);

-- Update user_settings policies
DROP POLICY IF EXISTS "User settings: owner or demo" ON user_settings;

CREATE POLICY "User settings: owner or demo accessible" ON user_settings FOR ALL USING (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true)
) WITH CHECK (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true)
);

-- Update ebay_tokens policies
DROP POLICY IF EXISTS "Ebay tokens: owner or demo" ON ebay_tokens;

CREATE POLICY "Ebay tokens: owner or demo accessible" ON ebay_tokens FOR ALL USING (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true)
) WITH CHECK (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true)
);
