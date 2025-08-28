# ScryVault Database Setup Guide

## 🚀 Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be ready

### 2. Get Your Credentials
1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public** key
3. Also copy the **service_role** key (keep this secret!)

### 3. Set Environment Variables
Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Database Schema
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `database-schema.sql`
4. Paste it into the SQL editor
5. Click **Run** to create all tables, policies, and seed data

### 5. Configure Storage (Optional)
If you want to store book photos:
1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `book-photos`
3. Set it to public if you want public access to images

## 📊 Database Schema Overview

### Core Tables

#### 📚 **Books** - Your main inventory
- **Book details**: title, authors, ISBN, publisher, etc.
- **Physical condition**: new, like new, good, acceptable, poor
- **Pricing**: purchase price, asking price, minimum price
- **Status tracking**: draft, listed, sold, archived
- **Full-text search** on title, authors, and description

#### 📷 **Photos** - Book images
- **File storage**: Supabase storage integration
- **Primary image**: Mark main book photo
- **AI metadata**: Future AI analysis results

#### 🔍 **Scans** - Scanning history
- **Scan methods**: camera, manual entry, photo upload
- **Location data**: Optional GPS coordinates
- **Confidence scores**: For AI-powered scans

#### 🏷️ **Listings** - eBay integration
- **eBay details**: Item ID, title, pricing, categories
- **Listing status**: draft, listed, sold, ended
- **API responses**: Store eBay API data

#### 📂 **Categories** - Book organization
- **Pre-seeded**: Fiction, Non-Fiction, Sci-Fi, etc.
- **Custom colors**: Visual organization
- **Public access**: All users can see categories

#### ⚙️ **User Settings** - App preferences
- **Notifications**: Scan, sale, marketing preferences
- **Appearance**: Theme, language settings
- **Business**: Currency, default shipping costs

## 🔒 Security Features

### Row Level Security (RLS)
- **Users can only see their own data**
- **Books, scans, listings are user-specific**
- **Photos linked to user's books only**
- **Categories are public**

### Performance Optimizations
- **Database indexes** on frequently queried columns
- **Full-text search** for book discovery
- **Automatic timestamps** with triggers
- **Optimized queries** with proper relationships

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# View your database
# Go to https://your-project-id.supabase.co

# Reset database (CAUTION - destroys data)
# Run the SQL schema again in Supabase SQL Editor
```

## 📝 Next Steps

Once your database is set up:

1. **Test the connection** - The app should connect to Supabase
2. **Create your first book** - Test the book creation flow
3. **Add authentication** - Implement user login/signup
4. **Connect the frontend** - Replace static data with real database queries

## 🔧 Troubleshooting

### Common Issues:

**"Environment variables not found"**
- Make sure your `.env.local` file is in the project root
- Restart the development server after adding variables

**"Table doesn't exist"**
- Make sure you ran the SQL schema in Supabase
- Check for any SQL errors during execution

**"Permission denied"**
- Verify your RLS policies are correctly set up
- Check that you're using the correct API keys

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

**🎉 Your ScryVault database is now ready!** The schema includes everything you need for a fully functional book scanning and inventory management system.
