# Barcode Scanner Setup Guide

## Overview

ScryVault now includes web-based barcode scanning using the html5-qrcode library. This feature allows users to scan ISBN barcodes directly from their device camera instead of manually typing them.

## Feature Status

**Current Status**: Implemented behind feature flag  
**Feature Flag**: `BARCODE_SCANNER` in `src/lib/feature-flags.ts`  
**Default State**: Disabled (set to `false`)

## How to Enable

To enable the barcode scanner feature:

1. Open `src/lib/feature-flags.ts`
2. Set `BARCODE_SCANNER: true`
3. Restart the development server

```typescript
export const FEATURES = {
  BARCODE_SCANNER: true,  // Enable scanner
  // ...
} as const
```

## Supported Barcode Formats

The scanner can detect:
- **ISBN-13** (EAN-13) - Most common format for books
- **ISBN-10** - Older ISBN format
- **EAN-13** - European Article Number
- **UPC** - Universal Product Code
- **Code 128** - General purpose barcode

## How to Use

### For End Users

1. Click the "Scan Barcode" button on the scan page
2. Allow camera access when prompted
3. Point the camera at the ISBN barcode on the book
4. Hold steady until the barcode is detected
5. The scanner will automatically close and populate the ISBN field
6. Book lookup will trigger automatically

### Manual Entry Fallback

Users can always:
- Click "Use Manual Entry Instead" button in the scanner
- Close the scanner and enter ISBN manually
- Skip scanning entirely and use the ISBN input field

## Browser Requirements

### Camera Access
- **HTTPS Required**: Browsers only allow camera access on HTTPS sites
- **Permissions**: User must grant camera permission
- **Privacy**: Camera feed is processed locally, never sent to servers

### Browser Compatibility

**✅ Fully Supported:**
- Chrome/Edge (Desktop & Mobile)
- Safari (iOS 11+)
- Firefox (Desktop & Mobile)
- Samsung Internet

**⚠️ Limited Support:**
- Older browsers may have issues
- Some browsers need manual permission grants

**❌ Not Supported:**
- HTTP sites (camera access blocked)
- Browsers without MediaDevices API

## Testing

### Test Page

A dedicated test page is available at `/test-scanner` for:
- Testing camera access
- Verifying scanner functionality
- Debugging camera issues
- Testing on different devices
- Checking browser compatibility

### Test Checklist

- [ ] Camera permissions granted
- [ ] Scanner opens and shows camera feed
- [ ] Can scan ISBN-13 barcodes
- [ ] Can scan ISBN-10 barcodes
- [ ] Scanned ISBN populates correctly
- [ ] Automatic lookup triggers
- [ ] Manual entry still works
- [ ] Error messages are clear
- [ ] Works on mobile devices
- [ ] Works on desktop browsers

## Troubleshooting

### Camera Not Working

**Problem**: "No cameras found" error

**Solutions**:
1. Ensure you're using HTTPS (check URL bar)
2. Grant camera permissions in browser settings
3. Check if other apps are using the camera
4. Try a different browser
5. Restart your device

### Scanner Not Detecting Barcode

**Problem**: Scanner shows camera but doesn't detect barcode

**Solutions**:
1. Ensure good lighting conditions
2. Hold book steady and flat
3. Try different distances from camera
4. Clean camera lens
5. Try a different barcode on the book
6. Use manual entry as fallback

### Permission Denied

**Problem**: Browser blocks camera access

**Solutions**:
1. Click the camera icon in URL bar
2. Change permission to "Allow"
3. Refresh the page
4. Clear site data and try again

### Blurry Image

**Problem**: Camera feed is blurry

**Solutions**:
1. Clean camera lens
2. Improve lighting
3. Hold device steady
4. Try manual focus (tap screen on mobile)
5. Move closer or further from barcode

## Architecture

### Components

**`src/components/BarcodeScanner.tsx`**
- Full-screen scanner modal
- Camera selection
- Auto-detection and scanning
- Error handling
- Mobile-optimized UI

**`src/app/test-scanner/page.tsx`**
- Isolated testing environment
- Debug logs and browser info
- Camera selection UI
- ISBN validation

### Integration

**`src/app/scan/page.tsx`**
- "Scan Barcode" button (behind feature flag)
- Scanner modal integration
- Automatic ISBN lookup after scan
- Manual entry fallback

### Feature Flag

**`src/lib/feature-flags.ts`**
- Controls scanner visibility
- Easy enable/disable
- No code changes needed to toggle

## Performance Considerations

### Mobile

- Scanner is optimized for mobile devices
- Prefers back camera (if available)
- Responsive scanning box
- Touch-optimized controls

### Desktop

- Works with webcams
- Larger scanning area
- Keyboard shortcuts (ESC to close)

### Resource Usage

- Camera stream stops when scanner closes
- No continuous scanning in background
- Memory cleanup on unmount

## Security & Privacy

- Camera feed processed locally in browser
- No video/images sent to servers
- Scanner uses standard Web APIs
- User must explicitly grant camera permission
- Permission can be revoked at any time

## Future Improvements

### Planned Enhancements

- [ ] Flash/torch control for low light
- [ ] Zoom controls for better focus
- [ ] Scan history
- [ ] Batch scanning mode
- [ ] Photo upload as alternative
- [ ] Server-side OCR fallback

### Native Mobile App

For the best barcode scanning experience, a React Native mobile app is planned with:
- Native camera APIs
- ML Kit for better detection
- Hardware acceleration
- Offline capability
- Professional-grade accuracy

## Support

If you encounter issues:
1. Test with `/test-scanner` page first
2. Check browser console for errors
3. Verify HTTPS and camera permissions
4. Try manual entry as fallback
5. Report issues with device/browser details

## Related Documentation

- `docs/CURRENT_STATE.md` - Current feature status
- `docs/EBAY_ARCHITECTURE.md` - eBay integration
- `README.md` - Project overview

