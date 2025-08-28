# ScryVault: The Complete Vision & Architecture

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

## 🏗️ **Technical Architecture**

### **Platform Strategy**
- **Phase 1:** Responsive web app (mobile-first)
- **Phase 2:** Expo React Native iOS mobile app for camera features
- **Cross-platform:** Works on iPhone, Android, desktop
- **Barcode Scanning:** Native camera integration via Expo

### **Tech Stack**
**Frontend:**
- Next.js (React framework for web app)
- React Native (future mobile app via Expo)
- TypeScript
- Responsive design with mobile-first approach

**Backend:**
- Supabase (PostgreSQL + API)
- Built-in authentication
- Real-time subscriptions
- File storage included

**External APIs:**
- eBay API (listings, sales, messaging)
- Google Books API (ISBN metadata)
- Supabase Storage (file uploads)

**Mobile:**
- Expo React Native
- Expo Camera for barcode scanning
- Expo Notifications for push alerts

**Deployment:**
- Vercel (Next.js web app)
- Expo (mobile app)
- Supabase (database & backend)

## 📱 **The "Scan-to-Live" Pipeline**

### **Phase 1: Manual Workflow**
1. **ISBN Entry:** Manual input or photo upload
2. **Metadata Lookup:** Google Books API integration
3. **Inventory Logging:** COGS, acquisition date, source
4. **Photo Management:** Upload and basic editing
5. **Manual Listing:** Form-based eBay listing creation
6. **Profit Tracking:** Basic analytics and reporting

### **Phase 2: AI Integration**
1. **AI Photography:** Computer vision for condition assessment
2. **Auto-Editing:** Image enhancement and cropping
3. **Intelligent Pricing:** Market analysis and dynamic pricing
4. **SEO Optimization:** AI-generated titles and descriptions
5. **One-Click Listing:** Automated eBay posting

### **Phase 3: Advanced Automation**
1. **Auto-Offers:** Automated watcher management
2. **Dynamic Repricing:** Market monitoring and price adjustments
3. **Sourcing Agent:** Inventory alerts and auto-purchase
4. **Post-Sale Automation:** Inventory updates and re-listing

## 🗂️ **Core Modules**

### **The Inventory Hub**
- Central database of all stock
- ISBN scanning and metadata lookup
- COGS and profit tracking
- Advanced filtering and sorting
- Status management (listed/unlisted/sold)

### **The Listing Optimization Agent**
- Automated offer management
- Title revision suggestions
- Dynamic repricing algorithms
- Performance analytics

### **The Sourcing Agent (Future)**
- Market monitoring and alerts
- Auto-purchase capabilities
- Profit margin analysis
- Inventory recommendations

## 📊 **Database Schema**

### **Core Tables**
- **Users:** Authentication and profiles
- **Books:** ISBN, metadata, condition, COGS
- **Listings:** eBay integration, pricing, status
- **Photos:** Image storage and management
- **Sales:** Transaction history and analytics

### **Relationships**
- One user can have many books
- One book can have many listings
- One book can have many photos
- One listing can have many sales

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

## 📈 **Scalability Considerations**

### **Performance**
- Database indexing and optimization
- API response caching
- Image compression and CDN
- Mobile-first responsive design

### **Growth**
- Modular architecture for feature additions
- API versioning strategy
- Database migration planning
- Cloud infrastructure scaling

## 🎯 **Success Metrics**

### **User Experience**
- Time from ISBN entry to live listing
- Photo upload and processing speed
- Inventory search and filter performance
- Mobile app responsiveness

### **Business Impact**
- Profit margin tracking accuracy
- Listing optimization effectiveness
- Time savings per listing
- User retention and engagement

## 🔄 **Development Phases**

### **Phase 1: MVP (8 weeks)**
- Responsive web app foundation
- Basic inventory management
- Manual listing creation
- Profit tracking

### **Phase 2: AI Integration (12 weeks)**
- Computer vision implementation
- LLM-powered features
- Automated workflows
- Enhanced analytics

### **Phase 3: Mobile App (8 weeks)**
- React Native development
- Camera integration
- Push notifications
- App Store deployment

### **Phase 4: Advanced Features (Ongoing)**
- Sourcing agent
- Auto-purchase capabilities
- Advanced automation
- Performance optimization

## 🛠️ **Development Environment**

### **Required Software**
- Node.js (v22.18.0) ✅
- Python (v3.13.7) ✅
- PostgreSQL (v17.6) ✅ (backup/testing)
- Git (v2.51) ✅
- Cursor IDE ✅

### **API Keys Required**
- eBay Developer Account (for later phases)
- Google Cloud Console (Books API)
- Supabase Account (primary database) ✅
- Expo Account (for mobile development)
- Vercel Account (for web deployment) ✅

### **Development Workflow**
- Git-based version control
- Feature branch development
- Code review process
- Automated testing
- Continuous deployment

## 📚 **Documentation Strategy**

### **Technical Documentation**
- API documentation
- Database schema
- Deployment guides
- Troubleshooting guides

### **User Documentation**
- Feature guides
- Best practices
- FAQ and support
- Video tutorials

## 🎉 **Launch Strategy**

### **Beta Testing**
- Closed beta with select users
- Feedback collection and iteration
- Performance monitoring
- Bug fixes and improvements

### **Public Launch**
- App Store deployment (Phase 3)
- Marketing and promotion
- User onboarding
- Support system

---

*This document serves as the foundational blueprint for ScryVault development. It should be updated as the project evolves and new requirements emerge.*
