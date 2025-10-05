# Demo System Setup - Execution Guide

## Overview
Run these SQL scripts in order to clean up the old demo user system and prepare for the new endpoint-based demo system.

## Script Execution Order

### 1. **01-complete-demo-cleanup.sql** ⚠️ **CRITICAL**
**What it does:**
- Removes demo user and all demo data
- Drops `is_demo` columns from all tables
- Cleans up demo-related policies and indexes
- Recreates clean RLS policies

**How to run:**
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `01-complete-demo-cleanup.sql`
4. Click **Run**

**Expected result:** "Demo system cleanup completed successfully!"

### 2. **02-fix-isbn-constraint.sql** ✅ **REQUIRED**
**What it does:**
- Removes the ISBN unique constraint that was causing your error
- Allows multiple books with the same ISBN

**How to run:**
1. In SQL Editor, copy and paste `02-fix-isbn-constraint.sql`
2. Click **Run**

**Expected result:** "ISBN constraint removed successfully. Multiple books can now share the same ISBN."

### 3. **03-test-demo-system.sql** 🔍 **VERIFICATION**
**What it does:**
- Verifies cleanup was successful
- Checks that no demo data remains
- Confirms RLS policies are clean

**How to run:**
1. In SQL Editor, copy and paste `03-test-demo-system.sql`
2. Click **Run**

**Expected result:** "Demo system cleanup and setup verification complete!"

## What Happens After Running These Scripts

### ✅ **Your Database Will Be:**
- Clean of all demo user data
- Free of `is_demo` columns
- Properly secured with clean RLS policies
- Able to handle duplicate ISBNs

### ✅ **Your Demo System Will Be:**
- Endpoint-based (no database storage)
- Client-side storage in browser
- Fresh data on each session
- Easy to customize and maintain

## Testing the New Demo System

### 1. **Test Demo Data Endpoint**
```bash
# In your browser or API client
GET http://localhost:3000/api/demo/sample-data
```
Should return randomized sample book data.

### 2. **Test Client Storage**
```typescript
// In browser console
import { demoStorage } from '/src/lib/demo-storage';
const data = await demoStorage.getData();
console.log(data);
```

### 3. **Test Save to Account**
```typescript
// After user authentication
const result = await demoStorage.saveToAccount(userId);
console.log(result);
```

## Troubleshooting

### If Script 1 Fails:
- Check for foreign key constraints
- Make sure you have admin access to the database
- Look for specific error messages in Supabase logs

### If Script 2 Fails:
- The constraint might not exist (that's fine)
- Check the constraint name in your database

### If Script 3 Shows Issues:
- Re-run Script 1 if demo data still exists
- Check RLS policies manually in Supabase dashboard

## Rollback Plan

If you need to rollback (not recommended):
1. Restore from database backup
2. Or re-run your original demo setup scripts

## Next Steps After Scripts

1. **Test the demo endpoints** in your app
2. **Update your components** to use the new demo storage
3. **Customize demo data** in the sample-data endpoint
4. **Deploy and test** in production

## Support

If you encounter any issues:
1. Check the Supabase logs for specific error messages
2. Verify your database permissions
3. Make sure you're running scripts in the correct order
4. Test each script individually if needed
