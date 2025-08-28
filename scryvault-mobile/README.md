# ScryVault Mobile App

The mobile companion app for ScryVault - Scan-to-Live Book Selling Platform.

## Features

### 📱 **Mobile-First Design**
- Native camera integration for ISBN barcode scanning
- Touch-optimized interface
- Dark theme with ScryVault branding
- Responsive design for all screen sizes

### 🔍 **Scanning Capabilities**
- **Camera Scan**: Real-time barcode scanning using device camera
- **Manual Entry**: Type ISBN numbers manually
- **Photo Upload**: Upload images for AI-powered ISBN detection
- **Recent Scans**: Quick access to recently scanned books

### 📊 **Dashboard & Analytics**
- Business metrics overview
- Recent activity feed
- Quick action buttons
- Performance statistics

### 📚 **Inventory Management**
- Complete book inventory
- Search and filter functionality
- Status tracking (Listed/Sold/Draft)
- Profit margin analysis
- Bulk operations

## Tech Stack

- **Framework**: Expo React Native
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Camera**: Expo Camera + Barcode Scanner
- **Icons**: Expo Vector Icons (Ionicons)
- **Image Picker**: Expo Image Picker

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Emulator

### Installation

1. **Navigate to the mobile directory**
   ```bash
   cd scryvault-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # iOS (requires macOS)
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## Project Structure

```
scryvault-mobile/
├── src/
│   └── screens/
│       ├── HomeScreen.tsx      # Dashboard overview
│       ├── ScanScreen.tsx      # Camera and scanning
│       ├── InventoryScreen.tsx # Book management
│       └── AnalyticsScreen.tsx # Performance metrics
├── App.tsx                     # Main app with navigation
├── app.json                    # Expo configuration
└── package.json               # Dependencies
```

## Features in Detail

### Home Screen
- Business metrics cards
- Quick action buttons
- Recent activity feed
- Navigation to other screens

### Scan Screen
- **Camera Mode**: Live barcode scanning with overlay
- **Manual Mode**: Text input for ISBN entry
- **Upload Mode**: Image picker for photo upload
- **Recent Scans**: History of scanned books

### Inventory Screen
- Book list with detailed information
- Search and filter capabilities
- Status badges (Listed/Sold/Draft)
- Profit margin calculations
- Action buttons (View/Edit/Delete)

### Analytics Screen
- Revenue and sales statistics
- Top performing books
- Recent sales activity
- Performance metrics
- Chart placeholders for future implementation

## Permissions

The app requires the following permissions:

- **Camera**: For barcode scanning
- **Photo Library**: For image upload
- **Storage**: For saving scanned data

## Development

### Adding New Features
1. Create new screen in `src/screens/`
2. Add navigation route in `App.tsx`
3. Update tab bar icons if needed
4. Test on both iOS and Android

### Styling
- Uses React Native StyleSheet
- Follows ScryVault design system
- Dark theme with emerald accents
- Consistent spacing and typography

### State Management
- Currently uses local state
- Ready for Redux/Context integration
- API integration points prepared

## Deployment

### Expo Build
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

### App Store Deployment
1. Configure app.json with proper metadata
2. Build production version
3. Submit to App Store/Google Play

## Future Enhancements

- [ ] Real-time sync with web app
- [ ] Push notifications
- [ ] Offline mode
- [ ] Advanced analytics charts
- [ ] Social sharing features
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test on both platforms
5. Submit pull request

## Support

For support and questions:
- Check the main ScryVault documentation
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ by the ScryVault Team**

*Transform your book business with mobile-first automation.*
