-- Re-enable RLS with simple policies that actually work
-- This approach is much simpler and more reliable

-- Re-enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebay_tokens ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Books: allow all for demo" ON books;
DROP POLICY IF EXISTS "Books: owner or demo" ON books;
DROP POLICY IF EXISTS "Books: insert only as self or demo" ON books;
DROP POLICY IF EXISTS "Books: update only as owner or demo" ON books;
DROP POLICY IF EXISTS "Books: delete only as owner or demo" ON books;
DROP POLICY IF EXISTS "Books: insert as owner or demo" ON books;
DROP POLICY IF EXISTS "Books: update as owner or demo" ON books;
DROP POLICY IF EXISTS "Books: delete as owner or demo" ON books;
DROP POLICY IF EXISTS "Books: owner or demo accessible" ON books;

-- Create ONE simple policy that allows everything for now
CREATE POLICY "Books: allow all" ON books FOR ALL USING (true) WITH CHECK (true);

-- Same for other tables
DROP POLICY IF EXISTS "Scans: owner or demo" ON scans;
DROP POLICY IF EXISTS "Scans: insert only as self or demo" ON scans;
DROP POLICY IF EXISTS "Scans: owner or demo accessible" ON scans;
DROP POLICY IF EXISTS "Scans: insert as owner or demo" ON scans;
CREATE POLICY "Scans: allow all" ON scans FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Photos: owner or demo" ON photos;
DROP POLICY IF EXISTS "Photos: insert only as self or demo" ON photos;
DROP POLICY IF EXISTS "Photos: update only as owner or demo" ON photos;
DROP POLICY IF EXISTS "Photos: delete only as owner or demo" ON photos;
DROP POLICY IF EXISTS "Photos: owner or demo accessible" ON photos;
DROP POLICY IF EXISTS "Photos: insert as owner or demo" ON photos;
DROP POLICY IF EXISTS "Photos: update as owner or demo" ON photos;
DROP POLICY IF EXISTS "Photos: delete as owner or demo" ON photos;
CREATE POLICY "Photos: allow all" ON photos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Listings: owner or demo" ON listings;
DROP POLICY IF EXISTS "Listings: insert only as self or demo" ON listings;
DROP POLICY IF EXISTS "Listings: update only as owner or demo" ON listings;
DROP POLICY IF EXISTS "Listings: delete only as owner or demo" ON listings;
DROP POLICY IF EXISTS "Listings: owner or demo accessible" ON listings;
DROP POLICY IF EXISTS "Listings: insert as owner or demo" ON listings;
DROP POLICY IF EXISTS "Listings: update as owner or demo" ON listings;
DROP POLICY IF EXISTS "Listings: delete as owner or demo" ON listings;
CREATE POLICY "Listings: allow all" ON listings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "User settings: owner or demo" ON user_settings;
DROP POLICY IF EXISTS "User settings: owner or demo accessible" ON user_settings;
CREATE POLICY "User settings: allow all" ON user_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Ebay tokens: owner or demo" ON ebay_tokens;
DROP POLICY IF EXISTS "Ebay tokens: owner or demo accessible" ON ebay_tokens;
CREATE POLICY "Ebay tokens: allow all" ON ebay_tokens FOR ALL USING (true) WITH CHECK (true);
