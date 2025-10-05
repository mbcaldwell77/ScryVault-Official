# Create Demo User via Supabase Admin API

## Option 1: Using cURL (Recommended)

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

## Option 2: Using Supabase Dashboard

1. Go to Authentication → Users
2. Click "Add user"
3. Fill in:
   - Email: `demo@scryvault.com`
   - Password: `demo-password-123`
   - Auto Confirm User: ✅
   - User Metadata: `{"name": "Demo User", "is_demo": true}`

## Option 3: Using Supabase CLI

```bash
supabase auth users create demo@scryvault.com --password demo-password-123 --email-confirm
```

## After creating the user:

1. Note the user ID from the response
2. Demo user ID is already updated: `358c3277-8f08-4ee1-a839-b660b9155ec2`
3. Run the RLS policy updates
