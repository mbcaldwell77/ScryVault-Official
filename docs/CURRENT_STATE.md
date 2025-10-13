# ScryVault Current State (2025-10-12)

## Working Features
- **Barcode scanner with html5-qrcode** - Real-time ISBN scanning optimized for books with iOS support
- Manual ISBN entry with Google Books API lookup
- Book inventory management with filtering/sorting
- User authentication (Supabase)
- Demo mode with local storage
- Category management
- Profit tracking
- Mobile-responsive UI
- **eBay Integration with AI-Powered Listing Preview** - Using eBay's new Inventory Mapping API
  - OAuth 2.0 authentication
  - AI-generated listing suggestions
  - Automated inventory sync
  - Sales analytics
  - Seller policy management

## Recent Improvements (October 2025)
- **Migrated from QuaggaJS to html5-qrcode** for better iOS/Safari compatibility
- **Implemented eBay Inventory Mapping API** - AI-powered listing creation with category and description suggestions
- **Added eBay sync functionality** - Pull inventory and sales data from eBay
- **New database tables** for listing previews and sync tracking
- **Enhanced eBay integration UI** in inventory and settings pages

## Known Limitations
- Edit book functionality incomplete
- eBay listing preview approval modal (currently auto-approves AI suggestions)

## Database
- Supabase PostgreSQL
- Tables: users, books, categories, listings, ebay_tokens
- RLS policies active for production users
- Demo mode bypasses RLS with feature flag

## Environment Variables Required
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
- SUPABASE_SERVICE_ROLE_KEY
- GOOGLE_BOOKS_API_KEY
- EBAY_APP_ID
- EBAY_CERT_ID
- NEXT_PUBLIC_EBAY_REDIRECT_URI_DEV
- NEXT_PUBLIC_EBAY_REDIRECT_URI_PROD

