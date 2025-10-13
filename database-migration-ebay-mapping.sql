-- eBay Inventory Mapping and Sync Tables
-- Run this migration to add support for eBay's Inventory Mapping API

-- Table to store AI-generated listing previews from eBay
CREATE TABLE IF NOT EXISTS ebay_listing_previews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE SET NULL,
    
    -- eBay preview task data
    preview_task_id VARCHAR(255),
    preview_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    
    -- AI-generated listing data
    suggested_category_id VARCHAR(50),
    suggested_category_name TEXT,
    suggested_title TEXT,
    suggested_description TEXT,
    suggested_aspects JSONB, -- Item specifics suggested by AI
    suggested_price DECIMAL(10, 2),
    
    -- User's book data sent to eBay
    input_data JSONB,
    
    -- eBay's full response
    ebay_response JSONB,
    
    -- Draft listing state
    is_approved BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    ebay_listing_id VARCHAR(255), -- Set when published
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_book FOREIGN KEY (book_id) REFERENCES books(id)
);

-- Index for faster lookups
CREATE INDEX idx_listing_previews_user_id ON ebay_listing_previews(user_id);
CREATE INDEX idx_listing_previews_book_id ON ebay_listing_previews(book_id);
CREATE INDEX idx_listing_previews_status ON ebay_listing_previews(preview_status);
CREATE INDEX idx_listing_previews_task_id ON ebay_listing_previews(preview_task_id);

-- Table to track eBay sync status
CREATE TABLE IF NOT EXISTS ebay_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    sync_type VARCHAR(50) NOT NULL, -- 'inventory', 'sales', 'analytics'
    sync_status VARCHAR(50) DEFAULT 'started', -- started, completed, failed
    
    items_synced INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    
    error_message TEXT,
    sync_data JSONB, -- Additional sync metadata
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_sync_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for sync log
CREATE INDEX idx_sync_log_user_id ON ebay_sync_log(user_id);
CREATE INDEX idx_sync_log_type ON ebay_sync_log(sync_type);
CREATE INDEX idx_sync_log_status ON ebay_sync_log(sync_status);

-- Add eBay-specific columns to user_settings table
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS ebay_payment_policy_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS ebay_payment_policy_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS ebay_return_policy_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS ebay_return_policy_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS ebay_shipping_policy_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS ebay_shipping_policy_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS ebay_category_mapping JSONB, -- Store category mappings
ADD COLUMN IF NOT EXISTS ebay_auto_sync BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ebay_last_sync TIMESTAMP WITH TIME ZONE;

-- Add eBay listing data to books table
ALTER TABLE books
ADD COLUMN IF NOT EXISTS ebay_listing_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS ebay_sku VARCHAR(255),
ADD COLUMN IF NOT EXISTS ebay_status VARCHAR(50), -- draft, active, ended, sold
ADD COLUMN IF NOT EXISTS ebay_listed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ebay_sold_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ebay_sold_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS ebay_sync_enabled BOOLEAN DEFAULT false;

-- Index for eBay listings
CREATE INDEX IF NOT EXISTS idx_books_ebay_listing_id ON books(ebay_listing_id);
CREATE INDEX IF NOT EXISTS idx_books_ebay_sku ON books(ebay_sku);
CREATE INDEX IF NOT EXISTS idx_books_ebay_status ON books(ebay_status);

-- Enable RLS on new tables
ALTER TABLE ebay_listing_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebay_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ebay_listing_previews
CREATE POLICY "Users can view their own listing previews"
    ON ebay_listing_previews FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own listing previews"
    ON ebay_listing_previews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listing previews"
    ON ebay_listing_previews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listing previews"
    ON ebay_listing_previews FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for ebay_sync_log
CREATE POLICY "Users can view their own sync logs"
    ON ebay_sync_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync logs"
    ON ebay_sync_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE ebay_listing_previews IS 'Stores AI-generated listing previews from eBay Inventory Mapping API';
COMMENT ON TABLE ebay_sync_log IS 'Tracks synchronization operations between ScryVault and eBay';
COMMENT ON COLUMN ebay_listing_previews.preview_task_id IS 'Task ID from eBay for async preview generation';
COMMENT ON COLUMN ebay_listing_previews.suggested_aspects IS 'AI-suggested item specifics (aspects) for the listing';

