# ScryVault Current State (2025-01-11)

## Working Features
- Manual ISBN entry with Google Books API lookup
- Book inventory management with filtering/sorting
- User authentication (Supabase)
- Demo mode with local storage
- Category management
- Profit tracking
- Mobile-responsive UI

## Known Limitations
- No barcode scanner (manual entry only)
- eBay integration incomplete (OAuth works, listing creation needs testing)
- Edit book functionality incomplete

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

