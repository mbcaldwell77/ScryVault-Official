# ScryVault - Book Inventory Management

A simple, working book inventory management system for book sellers and collectors.

## What It Does

ScryVault helps you track your book inventory with:

- Manual ISBN entry (10 or 13 digits)
- Automatic book details lookup via Google Books API
- Purchase price (COGS) tracking
- Asking price management
- Book condition and notes
- Category organization
- Inventory filtering and search

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Google Books API key (optional, for ISBN lookups)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Create .env.local with:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# GOOGLE_BOOKS_API_KEY=your_google_books_api_key (optional)

# Run development server
npm run dev
```

Visit http://localhost:3000

### Database Setup

Run the `database-schema.sql` file in your Supabase SQL editor to create the required tables.

## Using ScryVault

### Adding Books

1. Go to the Scan page
2. Enter an ISBN manually (no scanner needed)
3. Review the book details fetched from Google Books
4. Add your purchase price (COGS)
5. Set asking price and condition
6. Save to inventory

### Managing Inventory

- View all books on the Inventory page
- Filter by status, category, condition
- Search by title, author, or ISBN
- Export to CSV
- Track total inventory value and profit margins

## Project Structure

```
scryvault-official/
├── src/
│   ├── app/              # Next.js pages
│   │   ├── inventory/    # Inventory management
│   │   ├── scan/         # Add books
│   │   ├── settings/     # User settings
│   │   └── api/          # API routes (empty)
│   ├── components/       # Shared components
│   └── lib/              # Utilities and config
├── database-schema.sql   # Database schema
└── README.md
```

## Technology Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS 4
- Supabase (PostgreSQL + Auth)
- Google Books API

## Current Status

This is a working, stable version focused on core inventory management functionality.

**Working Features:**
- Manual ISBN entry and lookup
- Book inventory tracking
- COGS and pricing management
- User authentication
- Category management
- Inventory filtering and export

**Known Limitations:**
- No barcode scanning (manual entry only)
- No marketplace integrations
- Basic edit functionality

## Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
```

## Support

For issues or questions, please refer to the documentation in the repository or check the database schema for table structures.

## License

MIT
