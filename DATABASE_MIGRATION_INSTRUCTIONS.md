# Database Migration Instructions

## ⚠️ IMPORTANT: Run This Before Using eBay Integration

The new eBay Inventory Mapping API features require additional database tables. You must run this migration **before** attempting to use eBay integration features.

---

## Step-by-Step Instructions

### 1. Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your ScryVault project
3. Click on **SQL Editor** in the left sidebar

### 2. Run the Migration
1. Click **New Query** button
2. Copy the entire contents of `database-migration-ebay-mapping.sql`
3. Paste into the SQL editor
4. Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### 3. Verify Success
You should see a success message indicating all tables and policies were created. Look for:
- ✅ Table `ebay_listing_previews` created
- ✅ Table `ebay_sync_log` created
- ✅ Columns added to `user_settings`
- ✅ Columns added to `books`
- ✅ RLS policies created

---

## What This Migration Does

### New Tables Created

#### `ebay_listing_previews`
Stores AI-generated listing drafts from eBay's Inventory Mapping API.

**Columns**:
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `book_id` - Foreign key to books (optional)
- `preview_task_id` - eBay task ID for tracking
- `preview_status` - Status: pending, processing, completed, failed
- `suggested_category_id` - AI-suggested eBay category
- `suggested_category_name` - Category name
- `suggested_title` - AI-generated title
- `suggested_description` - AI-generated description
- `suggested_aspects` - JSONB of item specifics
- `suggested_price` - AI-suggested price
- `input_data` - Original book data sent to eBay
- `ebay_response` - Full response from eBay
- `is_approved` - User approval status
- `is_published` - Whether published to eBay
- `ebay_listing_id` - eBay listing ID after publish
- Timestamps: `created_at`, `updated_at`, `completed_at`

#### `ebay_sync_log`
Tracks synchronization operations between ScryVault and eBay.

**Columns**:
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `sync_type` - Type: inventory, sales, analytics
- `sync_status` - Status: started, completed, failed
- `items_synced` - Count of successfully synced items
- `items_failed` - Count of failed items
- `error_message` - Error details if failed
- `sync_data` - JSONB metadata
- Timestamps: `started_at`, `completed_at`

### Extended Existing Tables

#### `user_settings` - New Columns
- `ebay_payment_policy_id` - Selected payment policy
- `ebay_payment_policy_name` - Policy display name
- `ebay_return_policy_id` - Selected return policy
- `ebay_return_policy_name` - Policy display name
- `ebay_shipping_policy_id` - Selected shipping policy
- `ebay_shipping_policy_name` - Policy display name
- `ebay_category_mapping` - JSONB for category mappings
- `ebay_auto_sync` - Enable automatic sync
- `ebay_last_sync` - Timestamp of last sync

#### `books` - New Columns
- `ebay_listing_id` - eBay listing ID
- `ebay_sku` - eBay SKU
- `ebay_status` - Status: draft, active, ended, sold
- `ebay_listed_at` - When listed on eBay
- `ebay_sold_at` - When sold on eBay
- `ebay_sold_price` - Final sale price
- `ebay_sync_enabled` - Enable sync for this book

### Security (RLS Policies)
All new tables have Row Level Security (RLS) enabled with policies ensuring:
- Users can only view their own data
- Users can only insert/update/delete their own records
- Service role can access all data for background jobs

---

## Rollback Instructions (If Needed)

If you need to undo this migration:

```sql
-- WARNING: This will delete all eBay preview and sync data!

-- Drop tables
DROP TABLE IF EXISTS ebay_listing_previews CASCADE;
DROP TABLE IF EXISTS ebay_sync_log CASCADE;

-- Remove columns from user_settings
ALTER TABLE user_settings 
DROP COLUMN IF EXISTS ebay_payment_policy_id,
DROP COLUMN IF EXISTS ebay_payment_policy_name,
DROP COLUMN IF EXISTS ebay_return_policy_id,
DROP COLUMN IF EXISTS ebay_return_policy_name,
DROP COLUMN IF EXISTS ebay_shipping_policy_id,
DROP COLUMN IF EXISTS ebay_shipping_policy_name,
DROP COLUMN IF EXISTS ebay_category_mapping,
DROP COLUMN IF EXISTS ebay_auto_sync,
DROP COLUMN IF EXISTS ebay_last_sync;

-- Remove columns from books
ALTER TABLE books
DROP COLUMN IF EXISTS ebay_listing_id,
DROP COLUMN IF EXISTS ebay_sku,
DROP COLUMN IF EXISTS ebay_status,
DROP COLUMN IF EXISTS ebay_listed_at,
DROP COLUMN IF EXISTS ebay_sold_at,
DROP COLUMN IF EXISTS ebay_sold_price,
DROP COLUMN IF EXISTS ebay_sync_enabled;
```

---

## Troubleshooting

### Error: "permission denied for table"
**Solution**: Ensure you're running the query as the database owner or have sufficient privileges.

### Error: "relation already exists"
**Solution**: The table already exists. You can either:
1. Skip the migration (tables are already created)
2. Drop the existing tables and re-run
3. Run only the parts that failed

### Error: "column already exists"
**Solution**: Some columns were already added. You can:
1. Modify the script to use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
2. Manually check which columns exist and skip those

### Error: "must be owner of table"
**Solution**: You need to be the table owner or have ALTER privileges. Contact your Supabase admin.

---

## Verification Queries

After running the migration, verify everything was created:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ebay_listing_previews', 'ebay_sync_log');

-- Check columns added to books
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'books'
AND column_name LIKE 'ebay_%';

-- Check columns added to user_settings
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_settings'
AND column_name LIKE 'ebay_%';

-- Check RLS policies
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('ebay_listing_previews', 'ebay_sync_log');
```

Expected results:
- 2 tables found
- 7 columns in books starting with 'ebay_'
- 9 columns in user_settings starting with 'ebay_'
- 6 RLS policies (4 for previews, 2 for sync_log)

---

## Next Steps After Migration

1. **Restart your application** (if running locally)
2. **Test eBay connection** in Settings page
3. **Fetch seller policies** to configure payment/return/shipping
4. **Try creating a listing** with AI preview

---

## Support

If you encounter issues:
1. Check Supabase logs for detailed error messages
2. Verify your Supabase plan supports the number of tables/policies
3. Ensure you have sufficient database permissions
4. Review the migration SQL for syntax errors

---

*Created: October 12, 2025*

