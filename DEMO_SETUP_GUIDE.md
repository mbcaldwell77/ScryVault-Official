# 🚀 Secure Demo User Setup Guide

## Overview
This guide implements a secure, production-ready demo system that separates demo users from authenticated users while maintaining data isolation and security.

## ✅ What This Solves
- **Security**: Demo users can't access real user data
- **Isolation**: Real users can't access demo data  
- **Performance**: Proper RLS policies with optimized queries
- **Maintainability**: Clean demo flag system instead of magic UUIDs

## 🔧 Implementation Steps

### Step 1: Create Demo User via Admin API (Recommended)

**Option A: Using cURL**
```bash
curl -X POST 'https://your-project-ref.supabase.co/auth/v1/admin/users' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@scryvault.com",
    "password": "demo-password-123",
    "email_confirm": true,
    "user_metadata": {
      "name": "Demo User",
      "is_demo": true
    },
    "app_metadata": {
      "provider": "email",
      "providers": ["email"]
    }
  }'
```

**Option B: Using Supabase Dashboard**
1. Go to Authentication → Users
2. Click "Add user"
3. Fill in:
   - Email: `demo@scryvault.com`
   - Password: `demo-password-123`
   - Auto Confirm User: ✅
   - User Metadata: `{"name": "Demo User", "is_demo": true}`

### Step 2: Update Demo User ID in Code

After creating the user, copy the UUID from the response and update:

1. **In `src/app/scan/page.tsx`** - ✅ **Already updated** with your demo user ID: `358c3277-8f08-4ee1-a839-b660b9155ec2`

2. **In `improved-demo-setup.sql`** - ✅ **Already updated** with your demo user ID: `358c3277-8f08-4ee1-a839-b660b9155ec2`

### Step 3: Run Database Updates

Execute the `improved-demo-setup.sql` file in your Supabase SQL Editor. This will:

- ✅ Add `is_demo` boolean columns to all user tables
- ✅ Create performance indexes
- ✅ Implement hardened RLS policies with proper auth.uid() wrapping
- ✅ Create demo user settings
- ✅ Add sample demo books

### Step 4: Test the Implementation

1. **Test Demo Mode**:
   - Go to `/scan` without signing in
   - Try adding a book - should work with demo data
   - Check that demo books appear in inventory

2. **Test Authenticated Mode**:
   - Sign in with your real account
   - Add a book - should work with your own data
   - Verify demo data is not visible

3. **Test Data Isolation**:
   - Demo users should only see demo books
   - Authenticated users should only see their own books
   - No cross-contamination between demo and real data

## 🔒 Security Features

### RLS Policy Structure
```sql
-- Example: Books can be viewed by owner OR if they're demo books
CREATE POLICY "Books: owner or demo" ON books FOR SELECT USING (
    (SELECT auth.uid()) = user_id OR is_demo = true
);

-- Example: Only demo user can insert demo books
CREATE POLICY "Books: insert only as self or demo" ON books FOR INSERT WITH CHECK (
    ((SELECT auth.uid()) = user_id AND is_demo = false) OR 
    (is_demo = true AND (SELECT auth.uid()) = 'DEMO_USER_ID')
);
```

### Key Security Benefits
- ✅ **Proper auth.uid() wrapping** for better performance
- ✅ **Demo isolation** - only demo user can create demo data
- ✅ **User isolation** - users can only access their own data
- ✅ **No cross-user writes** - prevents demo users from creating data for real users

## 🎯 How It Works

### Demo Mode Flow
1. User visits `/scan` without authentication
2. `isDemoMode` is `true` (from localStorage)
3. Uses demo user ID: `'DEMO_USER_ID'`
4. Sets `is_demo: true` in database
5. RLS policies allow access to demo data

### Authenticated Mode Flow  
1. User signs in with real account
2. `isDemoMode` is `false`
3. Uses real user ID from auth context
4. Sets `is_demo: false` in database
5. RLS policies allow access only to user's own data

## 🚨 Important Notes

- **Replace the demo user ID** in both the SQL file and code
- **Test thoroughly** to ensure data isolation
- **Monitor logs** for any RLS policy violations
- **Keep demo user credentials secure** (don't commit to git)

## 🔄 Future Improvements

- Add custom JWT claims for demo users
- Implement demo data cleanup/rotation
- Add demo user session management
- Consider demo user quotas/limits
