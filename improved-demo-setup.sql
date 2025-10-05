-- Improved Demo Setup with Security Best Practices
-- Run this AFTER creating the demo user via Admin API

-- 1. Add is_demo flag to user tables for cleaner demo identification
ALTER TABLE books ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE ebay_tokens ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_books_is_demo ON books(is_demo);
CREATE INDEX IF NOT EXISTS idx_scans_is_demo ON scans(is_demo);
CREATE INDEX IF NOT EXISTS idx_photos_is_demo ON photos(is_demo);
CREATE INDEX IF NOT EXISTS idx_listings_is_demo ON listings(is_demo);
CREATE INDEX IF NOT EXISTS idx_user_settings_is_demo ON user_settings(is_demo);
CREATE INDEX IF NOT EXISTS idx_ebay_tokens_is_demo ON ebay_tokens(is_demo);

-- 2.5. Note: ISBNs are not unique per user - multiple editions can share the same ISBN
-- Removed constraint that was preventing legitimate duplicate ISBNs

-- 2.6. Demo mode now uses client-side storage instead of persistent demo user
-- No need for is_demo columns or demo user isolation

-- 3. Drop existing policies (they'll be recreated with better security)
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
DROP POLICY IF EXISTS "Users can delete their own listings or demo listings" ON listings;

DROP POLICY IF EXISTS "Users can manage their own settings or demo settings" ON user_settings;
DROP POLICY IF EXISTS "Users can manage their own ebay tokens or demo tokens" ON ebay_tokens;

-- 4. Create hardened RLS policies with proper auth.uid() wrapping and demo isolation

-- Books policies
CREATE POLICY "Books: owner or demo" ON books FOR SELECT USING (
    (SELECT auth.uid()) = user_id OR is_demo = true
);

CREATE POLICY "Books: insert only as self or demo" ON books FOR INSERT WITH CHECK (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true AND (SELECT auth.uid()) = '358c3277-8f08-4ee1-a839-b660b9155ec2')
);

CREATE POLICY "Books: update only as owner or demo" ON books FOR UPDATE USING (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true AND (SELECT auth.uid()) = '358c3277-8f08-4ee1-a839-b660b9155ec2')
);

CREATE POLICY "Books: delete only as owner or demo" ON books FOR DELETE USING (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true AND (SELECT auth.uid()) = '358c3277-8f08-4ee1-a839-b660b9155ec2')
);

-- Scans policies
CREATE POLICY "Scans: owner or demo" ON scans FOR SELECT USING (
    (SELECT auth.uid()) = user_id OR is_demo = true
);

CREATE POLICY "Scans: insert only as self or demo" ON scans FOR INSERT WITH CHECK (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true AND (SELECT auth.uid()) = '358c3277-8f08-4ee1-a839-b660b9155ec2')
);

-- Photos policies
CREATE POLICY "Photos: owner or demo" ON photos FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM books 
        WHERE books.id = photos.book_id 
        AND ((SELECT auth.uid()) = books.user_id OR books.is_demo = true)
    )
);

CREATE POLICY "Photos: insert only as self or demo" ON photos FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM books 
        WHERE books.id = photos.book_id 
        AND (
            ((SELECT auth.uid()) = books.user_id AND books.is_demo = false) OR 
            (books.is_demo = true AND (SELECT auth.uid()) = '358c3277-8f08-4ee1-a839-b660b9155ec2')
        )
    )
);

CREATE POLICY "Photos: update only as owner or demo" ON photos FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM books 
        WHERE books.id = photos.book_id 
        AND (
            ((SELECT auth.uid()) = books.user_id AND books.is_demo = false) OR 
            (books.is_demo = true AND (SELECT auth.uid()) = '358c3277-8f08-4ee1-a839-b660b9155ec2')
        )
    )
);

CREATE POLICY "Photos: delete only as owner or demo" ON photos FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM books 
        WHERE books.id = photos.book_id 
        AND (
            ((SELECT auth.uid()) = books.user_id AND books.is_demo = false) OR 
            (books.is_demo = true AND (SELECT auth.uid()) = '358c3277-8f08-4ee1-a839-b660b9155ec2')
        )
    )
);

-- Listings policies
CREATE POLICY "Listings: owner or demo" ON listings FOR SELECT USING (
    (SELECT auth.uid()) = user_id OR is_demo = true
);

CREATE POLICY "Listings: insert only as self or demo" ON listings FOR INSERT WITH CHECK (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true AND (SELECT auth.uid()) = '358c3277-8f08-4ee1-a839-b660b9155ec2')
);

CREATE POLICY "Listings: update only as owner or demo" ON listings FOR UPDATE USING (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true AND (SELECT auth.uid()) = '358c3277-8f08-4ee1-a839-b660b9155ec2')
);

CREATE POLICY "Listings: delete only as owner or demo" ON listings FOR DELETE USING (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true AND (SELECT auth.uid()) = '358c3277-8f08-4ee1-a839-b660b9155ec2')
);

-- User settings policies
CREATE POLICY "User settings: owner or demo" ON user_settings FOR ALL USING (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true AND (SELECT auth.uid()) = '358c3277-8f08-4ee1-a839-b660b9155ec2')
) WITH CHECK (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true AND (SELECT auth.uid()) = '358c3277-8f08-4ee1-a839-b660b9155ec2')
);

-- Ebay tokens policies
CREATE POLICY "Ebay tokens: owner or demo" ON ebay_tokens FOR ALL USING (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true AND (SELECT auth.uid()) = '358c3277-8f08-4ee1-a839-b660b9155ec2')
) WITH CHECK (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true AND (SELECT auth.uid()) = '358c3277-8f08-4ee1-a839-b660b9155ec2')
);

-- 5. Create demo user settings (replace with actual demo user ID after creation)
INSERT INTO user_settings (
    user_id,
    is_demo,
    default_shipping_cost,
    ebay_return_policy,
    ebay_marketplace,
    ebay_listing_type
) VALUES (
    '358c3277-8f08-4ee1-a839-b660b9155ec2', -- Demo user ID
    true,
    5.99,
    '30 days',
    'EBAY_US',
    'fixed'
) ON CONFLICT (user_id) DO UPDATE SET
    is_demo = true,
    default_shipping_cost = 5.99,
    ebay_return_policy = '30 days',
    ebay_marketplace = 'EBAY_US',
    ebay_listing_type = 'fixed';

-- 6. Add sample demo books (replace with actual demo user ID after creation)
INSERT INTO books (
    user_id,
    is_demo,
    title,
    authors,
    isbn,
    isbn13,
    publisher,
    published_date,
    page_count,
    description,
    condition,
    condition_notes,
    purchase_price,
    asking_price,
    status
) VALUES 
(
    '358c3277-8f08-4ee1-a839-b660b9155ec2', -- Demo user ID
    true,
    'The Great Gatsby',
    ARRAY['F. Scott Fitzgerald'],
    '9780743273565',
    '9780743273565',
    'Scribner',
    '2004-09-30',
    180,
    'A classic American novel set in the Jazz Age, following the mysterious Jay Gatsby and his obsession with the beautiful Daisy Buchanan.',
    'good',
    'Minor shelf wear, pages are clean',
    8.99,
    12.99,
    'draft'
),
(
    '358c3277-8f08-4ee1-a839-b660b9155ec2', -- Demo user ID
    true,
    'To Kill a Mockingbird',
    ARRAY['Harper Lee'],
    '9780061120084',
    '9780061120084',
    'Harper Perennial',
    '2006-05-23',
    376,
    'A gripping tale of racial injustice and childhood innocence in the American South.',
    'very_good',
    'Excellent condition, no markings',
    9.99,
    15.99,
    'draft'
),
(
    '358c3277-8f08-4ee1-a839-b660b9155ec2', -- Demo user ID
    true,
    '1984',
    ARRAY['George Orwell'],
    '9780451524935',
    '9780451524935',
    'Signet Classics',
    '1961-01-01',
    328,
    'A dystopian social science fiction novel about totalitarian control and surveillance.',
    'good',
    'Some highlighting, otherwise good condition',
    7.99,
    11.99,
    'draft'
) ON CONFLICT (isbn, user_id) DO NOTHING;
