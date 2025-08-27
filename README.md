# ScryVault - Scan-to-Live Book Selling Platform

![ScryVault Logo](https://img.shields.io/badge/ScryVault-Scan--to--Live-blue?style=for-the-badge&logo=book)

Transform your book selling business with AI-powered automation. From ISBN scan to live eBay listing in minutes.

## 🎯 **Project Overview**

ScryVault is an all-in-one application that transforms the tedious process of selling books online into a streamlined, automated, and profitable operation. By leveraging agentic AI, it tackles the most time-consuming tasks—sourcing, photography, and listing—allowing you to focus on growth.

**Core Principle:** The "Scan-to-Live" pipeline - a seamless workflow from acquiring a book to a fully optimized live listing on eBay with minimal manual intervention.

## 🎨 **Design Vision: "The Vault"**

### **Visual Identity**
- **Theme:** Fantasy/sci-fi novel aesthetic with dark mode
- **Color Palette:**
  - Primary Dark: Deep charcoal/black (like rock formations)
  - Accent Silver: Cool metallic silver for borders, icons, and highlights
  - Accent Green: Vibrant sci-fi green for interactive elements and AI features
  - Warm Glow: Subtle golden-orange for important notifications
  - Text: Pure white and light silver for readability

### **Visual Themes**
- Crystalline/Chiseled UI: Sharp, angular elements
- Glowing Elements: Interactive buttons and AI features with subtle glow effects
- Reflective Surfaces: Subtle reflections and metallic textures
- Portal/Archway Motifs: Navigation and transitions

## 🚀 **Features**

### **Phase 1: Manual Workflow** ✅
- **ISBN Entry:** Manual input or photo upload
- **Metadata Lookup:** Google Books API integration
- **Inventory Logging:** COGS, acquisition date, source
- **Photo Management:** Upload and basic editing
- **Manual Listing:** Form-based eBay listing creation
- **Profit Tracking:** Basic analytics and reporting

### **Phase 2: AI Integration** (Coming Soon)
- **AI Photography:** Computer vision for condition assessment
- **Auto-Editing:** Image enhancement and cropping
- **Intelligent Pricing:** Market analysis and dynamic pricing
- **SEO Optimization:** AI-generated titles and descriptions
- **One-Click Listing:** Automated eBay posting

### **Phase 3: Advanced Automation** (Future)
- **Auto-Offers:** Automated watcher management
- **Dynamic Repricing:** Market monitoring and price adjustments
- **Sourcing Agent:** Inventory alerts and auto-purchase
- **Post-Sale Automation:** Inventory updates and re-listing

## 🛠️ **Tech Stack**

### **Frontend**
- **Next.js 15** - React framework for web app
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Responsive Design** - Mobile-first approach

### **Backend** (Planned)
- **Supabase** - PostgreSQL + API
- **Built-in authentication**
- **Real-time subscriptions**
- **File storage included**

### **External APIs** (Planned)
- **eBay API** - Listings, sales, messaging
- **Google Books API** - ISBN metadata
- **Supabase Storage** - File uploads

### **Mobile** (Future)
- **Expo React Native** - Cross-platform mobile app
- **Expo Camera** - Barcode scanning
- **Expo Notifications** - Push alerts

## 📱 **Pages & Features**

### **Landing Page** (`/`)
- Hero section with value proposition
- Feature highlights
- Call-to-action buttons
- Statistics showcase

### **Dashboard** (`/dashboard`)
- Overview of business metrics
- Recent activity feed
- Quick action buttons
- Performance statistics

### **Scan Page** (`/scan`)
- Multiple scanning options:
  - Camera barcode scanning
  - Manual ISBN entry
  - Photo upload for AI detection
- Recent scans history

### **Inventory** (`/inventory`)
- Complete book inventory management
- Search and filtering capabilities
- Status tracking (Listed/Sold/Draft)
- Profit margin analysis
- Bulk operations

## 🏗️ **Project Structure**

```
scryvault-official/
├── src/
│   ├── app/
│   │   ├── dashboard/     # Dashboard page
│   │   ├── scan/         # Scanning functionality
│   │   ├── inventory/    # Inventory management
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Landing page
│   │   └── globals.css   # Global styles
│   ├── lib/
│   │   └── utils.ts      # Utility functions
│   └── components/       # Reusable components (future)
├── public/               # Static assets
├── package.json          # Dependencies
└── README.md            # This file
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v22.18.0 or higher)
- npm or yarn package manager

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/scryvault-official.git
   cd scryvault-official
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### **Available Scripts**

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 **Design System**

### **Colors**
```css
/* Primary Colors */
--emerald-400: #34d399
--emerald-500: #10b981
--cyan-400: #22d3ee
--cyan-500: #06b6d4

/* Background Colors */
--gray-800: #1f2937
--gray-900: #111827

/* Text Colors */
--white: #ffffff
--gray-300: #d1d5db
--gray-400: #9ca3af
```

### **Components**
- **Cards:** Rounded corners with subtle borders and hover effects
- **Buttons:** Gradient backgrounds with glow effects
- **Inputs:** Dark theme with focus states
- **Navigation:** Sidebar with active states

## 📊 **Performance Metrics**

### **User Experience Goals**
- Time from ISBN entry to live listing: < 5 minutes
- Photo upload and processing: < 30 seconds
- Inventory search and filter: < 1 second
- Mobile app responsiveness: 100%

### **Business Impact Goals**
- 90% time savings per listing
- 5x faster listing creation
- 25% higher profit margins
- 24/7 AI monitoring

## 🔐 **Security & Compliance**

### **Data Protection**
- User authentication and authorization
- Secure API key management
- Data encryption at rest and in transit
- GDPR compliance considerations

### **eBay Integration**
- OAuth 2.0 authentication
- Rate limiting and error handling
- Policy compliance monitoring
- Sandbox testing environment

## 🚀 **Deployment**

### **Web App**
- **Platform:** Vercel
- **Framework:** Next.js
- **Domain:** scryvault.com (planned)

### **Mobile App** (Future)
- **Platform:** Expo
- **Stores:** App Store & Google Play
- **Updates:** Over-the-air updates

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation:** [docs.scryvault.com](https://docs.scryvault.com) (planned)
- **Email:** support@scryvault.com (planned)
- **Discord:** [ScryVault Community](https://discord.gg/scryvault) (planned)

## 🗺️ **Roadmap**

### **Phase 1: MVP** (Current)
- ✅ Responsive web app foundation
- ✅ Basic inventory management
- ✅ Manual listing creation
- ✅ Profit tracking

### **Phase 2: AI Integration** (Q1 2024)
- 🔄 Computer vision implementation
- 🔄 LLM-powered features
- 🔄 Automated workflows
- 🔄 Enhanced analytics

### **Phase 3: Mobile App** (Q2 2024)
- 📱 React Native development
- 📱 Camera integration
- 📱 Push notifications
- 📱 App Store deployment

### **Phase 4: Advanced Features** (Ongoing)
- 🤖 Sourcing agent
- 🤖 Auto-purchase capabilities
- 🤖 Advanced automation
- 🤖 Performance optimization

---

**Built with ❤️ by the ScryVault Team**

*Transform your book business with the power of AI automation.*
