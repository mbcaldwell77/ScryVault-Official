-- Fresh start: Simple demo setup that actually works
-- No complex RLS policies, just basic functionality

-- 1. Add is_demo columns to tables
ALTER TABLE books ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE ebay_tokens ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- 2. Create simple RLS policies that allow everything
-- This is for development - we can tighten security later

-- Books
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Books: allow all" ON books FOR ALL USING (true) WITH CHECK (true);

-- Scans  
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scans: allow all" ON scans FOR ALL USING (true) WITH CHECK (true);

-- Photos
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photos: allow all" ON photos FOR ALL USING (true) WITH CHECK (true);

-- Listings
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listings: allow all" ON listings FOR ALL USING (true) WITH CHECK (true);

-- User settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User settings: allow all" ON user_settings FOR ALL USING (true) WITH CHECK (true);

-- Ebay tokens
ALTER TABLE ebay_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ebay tokens: allow all" ON ebay_tokens FOR ALL USING (true) WITH CHECK (true);

-- 3. Add some demo books
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
    '358c3277-8f08-4ee1-a839-b660b9155ec2',
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
    '358c3277-8f08-4ee1-a839-b660b9155ec2',
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
    '358c3277-8f08-4ee1-a839-b660b9155ec2',
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
);

-- 4. Add demo user settings
INSERT INTO user_settings (
    user_id,
    is_demo,
    default_shipping_cost,
    ebay_return_policy,
    ebay_marketplace,
    ebay_listing_type
) VALUES (
    '358c3277-8f08-4ee1-a839-b660b9155ec2',
    true,
    5.99,
    '30 days',
    'EBAY_US',
    'fixed'
);
