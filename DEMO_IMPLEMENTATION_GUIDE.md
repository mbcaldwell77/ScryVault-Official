# Demo Implementation Guide

## Overview

ScryVault now uses an **endpoint-based demo system** instead of a persistent demo user. This approach is more secure, cleaner, and provides a better user experience.

## How It Works

### 1. Demo Data Generation
- **Endpoint**: `/api/demo/sample-data`
- **Function**: Generates randomized sample data (5-12 books, categories) on each request
- **Storage**: No data is stored in the database - everything is generated fresh

### 2. Client-Side Storage
- **Library**: `src/lib/demo-storage.ts`
- **Storage**: Uses localStorage to persist demo data during the session
- **Refresh**: Data automatically refreshes every hour or on page reload
- **Operations**: All CRUD operations happen locally in the browser

### 3. Save to Account
- **Endpoint**: `/api/demo/save-to-account`
- **Function**: Transfers selected demo data to a real user account
- **Security**: Validates user authentication before saving

## Implementation Details

### Demo Storage Class
```typescript
import { demoStorage } from '@/lib/demo-storage';

// Get demo data (fetches fresh if needed)
const data = await demoStorage.getData();

// Add a new book
const newBook = demoStorage.addBook({
  title: 'My New Book',
  authors: ['Author Name'],
  // ... other fields
});

// Update a book
demoStorage.updateBook(bookId, { title: 'Updated Title' });

// Delete a book
demoStorage.deleteBook(bookId);

// Save demo data to real account
const result = await demoStorage.saveToAccount(userId);
```

### API Endpoints

#### GET `/api/demo/sample-data`
Returns randomized sample data:
```json
{
  "books": [...],
  "categories": [...],
  "metadata": {
    "generated_at": "2024-01-01T00:00:00Z",
    "version": "1.0",
    "demo_mode": true
  }
}
```

#### POST `/api/demo/save-to-account`
Saves demo data to authenticated user account:
```json
{
  "userId": "user-uuid",
  "data": {
    "books": [...],
    "categories": [...]
  }
}
```

## Benefits

### Security
- ✅ No demo data in production database
- ✅ No RLS complexity for demo access
- ✅ No cross-user data leakage risks
- ✅ No uniqueness constraint issues

### Performance
- ✅ No database queries for demo operations
- ✅ Fast local storage operations
- ✅ Reduced server load

### User Experience
- ✅ Fresh data on each demo session
- ✅ No persistence between demo sessions
- ✅ Easy to customize demo data
- ✅ Clear separation between demo and real data

## Migration from Demo User

### Files Created
- `src/app/api/demo/sample-data/route.ts` - Demo data endpoint
- `src/app/api/demo/save-to-account/route.ts` - Save to account endpoint
- `src/lib/demo-storage.ts` - Client-side demo storage
- `cleanup-demo-setup.sql` - Cleanup script for old demo system

### Files Modified
- `improved-demo-setup.sql` - Removed ISBN constraint and demo user references

### Database Changes
Run the cleanup script to remove the old demo system:
```sql
-- Remove demo user and clean up policies
\i cleanup-demo-setup.sql
```

## Usage in Components

### Demo Mode Detection
```typescript
// Check if user is in demo mode
const isDemoMode = !user || user.email === 'demo@scryvault.com';

// Get demo data
const demoData = await demoStorage.getData();
```

### Demo Operations
```typescript
// All demo operations are local
if (isDemoMode) {
  // Use demo storage
  demoStorage.addBook(bookData);
} else {
  // Use real database
  await supabase.from('books').insert(bookData);
}
```

### Save Demo to Account
```typescript
// When user signs up or logs in
const saveResult = await demoStorage.saveToAccount(user.id);
if (saveResult.success) {
  // Redirect to real app
  demoStorage.clearData();
  router.push('/inventory');
}
```

## Configuration

### Demo Data Customization
Edit `src/app/api/demo/sample-data/route.ts` to customize:
- Number of books (currently 5-12)
- Book titles and authors
- Categories and colors
- Pricing ranges
- Conditions and descriptions

### Storage Settings
Edit `src/lib/demo-storage.ts` to modify:
- Refresh interval (currently 1 hour)
- Storage key names
- Fallback data structure

## Testing

### Demo Mode Testing
1. Visit the app without authentication
2. Verify demo data loads automatically
3. Test CRUD operations (should work locally)
4. Refresh page - should get new sample data

### Save to Account Testing
1. Create demo data
2. Sign up or log in
3. Verify data transfers to real account
4. Confirm demo data is cleared

## Troubleshooting

### Common Issues

**Demo data not loading**
- Check browser console for API errors
- Verify `/api/demo/sample-data` endpoint is accessible
- Check localStorage is enabled

**Save to account failing**
- Verify user is authenticated
- Check database permissions
- Review server logs for constraint violations

**Data not persisting in demo**
- Check localStorage quota
- Verify demo storage is working
- Check for JavaScript errors

### Debug Commands
```typescript
// Check demo storage state
console.log(demoStorage.getData());

// Force refresh demo data
await demoStorage.fetchFreshData();

// Clear demo data
demoStorage.clearData();
```

## Future Enhancements

### Potential Improvements
- [ ] Demo data templates (different themes/genres)
- [ ] Demo progress tracking
- [ ] Demo data export/import
- [ ] Demo analytics
- [ ] Demo tutorial mode

### API Enhancements
- [ ] Demo data versioning
- [ ] Demo data caching
- [ ] Demo data personalization
- [ ] Demo data analytics

## Security Considerations

### Current Security
- ✅ No demo data in database
- ✅ No cross-user access
- ✅ Authenticated save operations
- ✅ Input validation and sanitization

### Additional Security
- [ ] Rate limiting on demo endpoints
- [ ] Demo data size limits
- [ ] Demo data validation
- [ ] Audit logging for demo saves
