-- ScryVault Database Schema
-- Book scanning and inventory management system

-- =============================================
-- 1. CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#10b981', -- Hex color code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. BOOKS TABLE (Core inventory)
-- =============================================
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Book identification
    title VARCHAR(500) NOT NULL,
    authors TEXT[], -- Array of author names
    isbn VARCHAR(20),
    isbn13 VARCHAR(20),

    -- Book details
    publisher VARCHAR(200),
    published_date DATE,
    page_count INTEGER,
    language VARCHAR(10) DEFAULT 'en',
    description TEXT,

    -- Physical condition
    condition VARCHAR(20) CHECK (condition IN ('new', 'like_new', 'very_good', 'good', 'acceptable', 'poor')),
    condition_notes TEXT,

    -- Pricing and costs
    purchase_price DECIMAL(10,2),
    purchase_source VARCHAR(200),
    purchase_date DATE,

    -- Listing information
    asking_price DECIMAL(10,2),
    minimum_price DECIMAL(10,2),

    -- Categories and tags
    category_id UUID REFERENCES categories(id),
    tags TEXT[], -- Array of tags

    -- Status tracking
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'listed', 'sold', 'archived')),
    listed_at TIMESTAMP WITH TIME ZONE,
    sold_at TIMESTAMP WITH TIME ZONE,
    sold_price DECIMAL(10,2),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Full text search
    search_vector TSVECTOR
);

-- =============================================
-- 3. SCANS TABLE (Scanning events)
-- =============================================
CREATE TABLE scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,

    -- Scan details
    scan_method VARCHAR(20) NOT NULL CHECK (scan_method IN ('camera', 'manual', 'upload')),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Scan data
    raw_data JSONB, -- Store raw scan data
    confidence_score DECIMAL(3,2), -- AI confidence score (0-1)

    -- Location (optional)
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. PHOTOS TABLE (Book images)
-- =============================================
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,

    -- File information
    file_path TEXT NOT NULL, -- Supabase storage path
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),

    -- Image metadata
    width INTEGER,
    height INTEGER,
    is_primary BOOLEAN DEFAULT FALSE, -- Main book image

    -- AI analysis (future feature)
    ai_description TEXT,
    ai_tags TEXT[],

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. LISTINGS TABLE (eBay listings)
-- =============================================
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- eBay listing details
    ebay_item_id VARCHAR(50) UNIQUE,
    title VARCHAR(80) NOT NULL, -- eBay title limit
    description TEXT,

    -- Pricing
    start_price DECIMAL(10,2) NOT NULL,
    reserve_price DECIMAL(10,2),
    buy_it_now_price DECIMAL(10,2),

    -- Listing details
    category_id INTEGER, -- eBay category ID
    condition VARCHAR(20) CHECK (condition IN ('new', 'like_new', 'very_good', 'good', 'acceptable', 'poor')),
    shipping_cost DECIMAL(8,2),

    -- Listing status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'listed', 'sold', 'ended', 'cancelled')),
    listed_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,

    -- eBay response data
    ebay_response JSONB,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. USER SETTINGS TABLE
-- =============================================
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,

    -- Notification preferences
    scan_notifications BOOLEAN DEFAULT TRUE,
    sale_notifications BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,

    -- App preferences
    theme VARCHAR(20) DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
    language VARCHAR(10) DEFAULT 'en',

    -- Business settings
    default_currency VARCHAR(3) DEFAULT 'USD',
    default_shipping_cost DECIMAL(8,2) DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. EBAY_TOKENS TABLE
-- =============================================
CREATE TABLE ebay_tokens (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scopes TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Books table indexes
CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_category ON books(category_id);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_search ON books USING gin(search_vector);
CREATE INDEX idx_books_created_at ON books(created_at);

-- Scans table indexes
CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_book_id ON scans(book_id);
CREATE INDEX idx_scans_created_at ON scans(created_at);

-- Photos table indexes
CREATE INDEX idx_photos_book_id ON photos(book_id);
CREATE INDEX idx_photos_primary ON photos(book_id, is_primary);

-- Listings table indexes
CREATE INDEX idx_listings_book_id ON listings(book_id);
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_ebay_item_id ON listings(ebay_item_id);

-- Ebay tokens table indexes
CREATE INDEX idx_ebay_tokens_user_id ON ebay_tokens(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebay_tokens ENABLE ROW LEVEL SECURITY;

-- Categories (public read)
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

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
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_book_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english',
        COALESCE(NEW.title, '') || ' ' ||
        array_to_string(COALESCE(NEW.authors, '{}'), ' ') || ' ' ||
        COALESCE(NEW.description, '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ebay_tokens_updated_at
    BEFORE UPDATE ON ebay_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for search vector
CREATE TRIGGER update_books_search_vector
    BEFORE INSERT OR UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_book_search_vector();

-- =============================================
-- DEFAULT DATA
-- =============================================

-- Insert default categories
INSERT INTO categories (name, description, color) VALUES
('Fiction', 'Novels, short stories, and fictional works', '#3b82f6'),
('Non-Fiction', 'Educational, biographical, and factual books', '#10b981'),
('Science Fiction', 'Futuristic, space, and speculative fiction', '#8b5cf6'),
('Mystery', 'Detective, thriller, and suspense novels', '#f59e0b'),
('Romance', 'Love stories and romantic fiction', '#ec4899'),
('Biography', 'Life stories and memoirs', '#06b6d4'),
('History', 'Historical events and periods', '#84cc16'),
('Self-Help', 'Personal development and motivation', '#f97316'),
('Textbook', 'Educational and academic materials', '#6366f1'),
('Children', 'Books for young readers', '#14b8a6');

-- =============================================
-- DEVELOPMENT HELPERS (Remove in production)
-- =============================================

-- =============================================
-- TEMPORARY FIX FOR DEMO DATA PERSISTENCE
-- =============================================
-- For demo/personal use, temporarily disable RLS to allow data persistence
-- Remove these lines when implementing proper authentication

ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE scans DISABLE ROW LEVEL SECURITY;
ALTER TABLE photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE ebay_tokens DISABLE ROW LEVEL SECURITY;

-- Temporarily make user_id nullable for development
-- ALTER TABLE books ALTER COLUMN user_id DROP NOT NULL;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE categories IS 'Book categories and genres for organization';
COMMENT ON TABLE books IS 'Core inventory table containing all book information';
COMMENT ON TABLE scans IS 'Tracks individual book scanning events';
COMMENT ON TABLE photos IS 'Images associated with books';
COMMENT ON TABLE listings IS 'eBay listings created from books';
COMMENT ON TABLE user_settings IS 'User preferences and app settings';
COMMENT ON TABLE ebay_tokens IS 'eBay OAuth tokens for user authentication';

COMMENT ON COLUMN books.search_vector IS 'Full-text search index for book titles, authors, and descriptions';
COMMENT ON COLUMN books.condition IS 'Physical condition of the book (new, like_new, very_good, good, acceptable, poor)';
COMMENT ON COLUMN books.status IS 'Current status of the book (draft, listed, sold, archived)';
COMMENT ON COLUMN listings.status IS 'Status of eBay listing (draft, listed, sold, ended, cancelled)';
COMMENT ON COLUMN photos.is_primary IS 'Indicates if this is the main image for the book';
COMMENT ON COLUMN scans.scan_method IS 'Method used to scan the book (camera, manual, upload)';
