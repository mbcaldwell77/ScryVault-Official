# eBay Integration Architecture

## Current Implementation Status
- OAuth 2.0 flow: Implemented
- Token storage: Supabase ebay_tokens table
- Token refresh: Implemented in ebay-server.ts
- API routes: All created, need testing

## API Routes
- /api/ebay/status - Check auth status
- /api/ebay/exchange - OAuth code exchange
- /api/ebay/inventory - Create inventory items
- /api/ebay/offer - Create offers
- /api/ebay/publish - Publish listings
- /api/ebay/logout - Clear tokens

## Flow
1. User clicks "Connect eBay" in settings
2. Redirect to eBay OAuth
3. eBay redirects to callback with code
4. Exchange code for tokens
5. Store tokens in Supabase
6. List book: inventory → offer → publish

## Token Management

### Token Lifecycle
- Access tokens expire after a set period (typically 2 hours)
- Refresh tokens used to obtain new access tokens
- Tokens stored in `ebay_tokens` table with user_id, access_token, refresh_token, expires_at

### Refresh Logic
Located in `src/lib/ebay-server.ts`:
- `isTokenExpired()` checks if token expires within 5 minutes
- `getValidAccessToken()` automatically refreshes if expired
- `refreshEbayToken()` calls eBay token endpoint with refresh_token grant

### Error Scenarios
- **No token found**: User must connect eBay account
- **Refresh token expired**: User must re-authenticate
- **Network errors**: Retry with exponential backoff
- **Invalid credentials**: Clear tokens and require re-auth

## Server-Side API Routes

All eBay API calls must go through server-side routes to protect credentials:

### /api/ebay/status
- **Method**: GET
- **Purpose**: Check if user has valid eBay tokens
- **Returns**: `{ authenticated: boolean }`

### /api/ebay/exchange
- **Method**: POST
- **Purpose**: Exchange OAuth code for access/refresh tokens
- **Body**: `{ code: string }`
- **Returns**: `{ success: boolean }`

### /api/ebay/inventory
- **Method**: PUT
- **Purpose**: Create/update inventory item
- **Body**: `{ sku: string, bookData: BookData }`
- **Returns**: eBay inventory item response

### /api/ebay/offer
- **Method**: POST
- **Purpose**: Create offer for inventory item
- **Body**: `{ sku: string, bookData: BookData }`
- **Returns**: eBay offer response with offerId

### /api/ebay/publish
- **Method**: POST
- **Purpose**: Publish offer to create live listing
- **Body**: `{ offerId: string }`
- **Returns**: eBay listing response with listingId

### /api/ebay/logout
- **Method**: POST
- **Purpose**: Clear user's eBay tokens
- **Returns**: `{ success: boolean }`

## Testing Strategy

### Phase 1: Route Testing
- Test each route independently with curl/Postman
- Use eBay sandbox credentials
- Verify token refresh logic
- Document all error cases

### Phase 2: OAuth Flow
- Test complete connection flow
- Verify token storage
- Test token expiration and refresh
- Verify user feedback

### Phase 3: Listing Flow
- Test with one book in sandbox
- Verify inventory → offer → publish pipeline
- Test error handling at each step
- Verify database updates

## Security Considerations

- Never expose eBay credentials in client code
- All API calls use server-side routes
- Tokens stored securely in Supabase
- User can only access their own tokens (RLS)
- Token refresh happens transparently

