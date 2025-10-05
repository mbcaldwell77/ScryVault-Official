# ScryVault - Scan-to-Live Book Management Platform

## 🚀 **Current Status: Ready for eBay Integration!**

ScryVault is a comprehensive book inventory management platform designed for book sellers, collectors, and resellers. The platform provides a **native mobile experience** with fast manual ISBN entry and seamless desktop functionality for inventory management and analytics.

## ✨ **Key Features**

### 📱 **Mobile-First Design**
- **Native Mobile Experience**: Beautiful, intuitive mobile interface optimized for barcode scanning
- **Responsive Design**: Seamless experience across mobile, tablet, and desktop
- **Touch Optimization**: 44px minimum touch targets for excellent mobile interaction
- **Collapsible Navigation**: Smart mobile sidebar with hamburger menu and overlay

### 🔍 **Advanced Inventory Management**
- **ISBN Search**: Hyphen-agnostic search with Google Books API integration
- **Advanced Filtering**: Multi-criteria filtering (status, category, condition, price range, date range)
- **Bulk Operations**: Multi-select functionality with bulk actions
- **CSV Export**: Complete data export capabilities
- **Real-time Updates**: Live inventory tracking and updates

### 📊 **Comprehensive Analytics**
- **Business Metrics**: Total books, categories, sold items, total value, profit margins
- **Performance Tracking**: Revenue trends and conversion rates
- **Visual Dashboards**: Beautiful charts and data visualization
- **Export Capabilities**: Detailed reporting and data analysis

### 🏷️ **Category Management**
- **Pre-built Categories**: Fantasy, Vintage, Antique, Activity, Textbook
- **Custom Categories**: Add and manage your own categories
- **Color Coding**: Visual category organization
- **Filter Integration**: Categories integrated into filtering system

### 📝 **Enhanced Metadata**
- **Condition Tracking**: Book condition and detailed condition notes
- **Category Assignment**: Automatic and manual category assignment
- **Price Management**: Purchase price and asking price tracking
- **Profit Calculation**: Real-time profit margin calculations

### 🎭 **Demo Mode**
- **Sample Data**: Add sample books and categories for testing
- **Demo Features**: Conditional rendering for demo-specific functionality
- **User Experience**: Clear distinction between demo and personal accounts

## 🛠️ **Technology Stack**

### **Frontend**
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library

### **Backend**
- **Supabase**: PostgreSQL database with real-time capabilities
- **Authentication**: Built-in auth with social providers
- **Row Level Security**: Secure data access
- **Real-time Subscriptions**: Live data updates

### **APIs & Integrations**
- **Google Books API**: ISBN metadata lookup
- **eBay API**: Ready for integration (OAuth 2.0 configured)
- **Vercel**: Production deployment platform

### **Mobile Development**
- **React Native**: Cross-platform mobile app (planned)
- **Expo**: Development framework for mobile
- **Native Camera**: Barcode scanning capabilities

## 📱 **Mobile Experience**

### **Responsive Design**
- **Mobile-First**: Designed for fast book entry workflows
- **Touch Optimized**: Proper touch targets and spacing
- **Smooth Animations**: Hardware-accelerated transitions
- **Intuitive Navigation**: Collapsible sidebar with overlay

### **Book Entry**
- **Manual ISBN Entry**: Fast, reliable manual entry (5 seconds to type 13 digits)
- **Automatic Lookup**: Google Books API fetches all book details automatically
- **Mobile Optimized**: Large input fields and buttons for easy mobile use
- **Universal**: Works on all devices and browsers, no permissions needed

### **Layout System**
- **Unified Padding**: Consistent spacing across all pages
- **Responsive Grids**: Adaptive layouts for all screen sizes
- **Flex Constraints**: Proper overflow prevention
- **Breakpoint Strategy**: Mobile-first responsive design

### **Performance**
- **Fast Loading**: Optimized for mobile networks
- **Smooth Interactions**: 60fps animations and transitions
- **Memory Efficient**: Optimized component rendering
- **Touch Responsive**: Immediate feedback on interactions

### **⚠️ Barcode Scanning Note**
Web-based barcode scanning is **not currently supported** due to browser limitations:
- Poor camera quality and autofocus via WebRTC
- Unreliable detection accuracy on mobile browsers
- Inconsistent performance across devices

**Recommended alternatives:**
- **Manual entry** (current method): Fast, reliable, works everywhere
- **Native mobile app** (future): React Native with ML Kit for professional barcode scanning
- **Photo upload** (potential): Server-side OCR processing

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Books API key

### **Installation**
```bash
# Clone the repository
git clone https://github.com/your-username/scryvault-official.git
cd scryvault-official

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase and Google Books API credentials

# Run the development server
npm run dev
```

### **Environment Variables**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Books API
GOOGLE_BOOKS_API_KEY=your_google_books_api_key

# eBay API (for future integration)
EBAY_APP_ID=your_ebay_app_id
EBAY_CERT_ID=your_ebay_cert_id
EBAY_CLIENT_SECRET=your_ebay_client_secret
```

## 📁 **Project Structure**

```
scryvault-official/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── components/         # Page-specific components
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── inventory/          # Inventory management
│   │   ├── scan/              # Book scanning interface
│   │   ├── analytics/         # Analytics and reporting
│   │   └── settings/          # User settings
│   ├── components/            # Shared components
│   │   ├── AuthGuard.tsx      # Authentication wrapper
│   │   ├── Header.tsx         # Mobile-responsive header
│   │   └── Sidebar.tsx        # Collapsible navigation
│   └── lib/                   # Utilities and configurations
│       ├── supabase.ts        # Supabase client
│       ├── auth-context.tsx   # Authentication context
│       └── utils.ts           # Utility functions
├── scryvault-mobile/          # React Native mobile app
├── database-schema.sql        # Database schema
└── README.md                  # This file
```

## 🎯 **Current Development Status**

### **✅ Completed Features**
- **Mobile UI Overhaul**: Complete responsive redesign
- **Advanced Inventory Management**: Filtering, sorting, bulk operations
- **Category Management**: Pre-built and custom categories
- **Metadata Enhancement**: Condition tracking and notes
- **Demo Mode**: Sample data and demo-specific features
- **Error Handling**: Comprehensive error management
- **Performance Optimization**: Mobile-first performance

### **🚀 Next Priority: eBay Integration**
- **OAuth 2.0 Flow**: eBay API authentication
- **Listing Creation**: Automated eBay listing generation
- **Profit Calculation**: Real-time profit margin calculations
- **Inventory Sync**: Bidirectional inventory management

### **📋 Future Roadmap**
- **Phase 3**: Advanced analytics and reporting
- **Phase 4**: React Native mobile app
- **Phase 5**: Multi-marketplace integration
- **Phase 6**: Enterprise features and team collaboration

## 🔧 **Development**

### **Available Scripts**
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks

# Mobile Development
cd scryvault-mobile
npm start            # Start Expo development server
```

### **Database Setup**
```sql
-- Run the database schema
\i database-schema.sql

-- Set up Row Level Security policies
-- (See database-schema.sql for details)
```

## 📊 **Performance Metrics**

### **Mobile Performance**
- **First Contentful Paint**: < 2.5s
- **Largest Contentful Paint**: < 3s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### **Build Performance**
- **Bundle Size**: ~102kB shared JS
- **Build Time**: ~5.3s
- **Page Load Times**: Optimized for mobile

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: Check the markdown files in the repository
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join the community discussions

---

## 🎉 **Recent Updates**

### **Session 3: Barcode Scanner Investigation**
Investigated web-based barcode scanning and concluded it's not viable for production. Simplified UI to focus on fast, reliable manual ISBN entry which works better than fighting with browser camera limitations.

### **Session 2: Mobile UI Overhaul**
Complete mobile UI overhaul with native mobile experience. All responsiveness issues resolved and layout system unified across all pages.

**Current Focus: eBay integration and marketplace connectivity!** 🚀

## Setup Instructions

### Environment Variables

Create .env.local with:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EBAY_APP_ID=your_app_id
EBAY_CERT_ID=your_cert_id
NEXT_PUBLIC_EBAY_REDIRECT_URI_DEV=your_dev_redirect
NEXT_PUBLIC_EBAY_REDIRECT_URI_PROD=your_prod_redirect
EBAY_VERIFICATION_TOKEN=your_webhook_token

### Obtaining eBay Credentials

1. Go to eBay Developers Program
2. Create app
3. Get App ID, Cert ID
4. Set redirect URIs
5. For sandbox/testing, use sandbox credentials

### Running Locally

npm install
npm run dev

### Connecting to eBay

Go to Settings, click Connect to eBay, authorize.

### Listing a Book

In Inventory, select book, click List on eBay, preview and confirm.