# Phase 1: Barcode Scanner Test Checklist

## Pre-Test Setup

### Local Testing
- [ ] Restart dev server (Ctrl+C, then `npm run dev`) to clear localStorage error
- [ ] Confirm server running at http://localhost:3000
- [ ] Confirm BARCODE_SCANNER flag is `true` in `src/lib/feature-flags.ts`

### Mobile Testing
- [ ] Confirm Vercel deployment successful at your production URL
- [ ] Open production URL on mobile device
- [ ] Ensure you're on HTTPS (required for camera access)

## Test 1: Test Scanner Page (Isolated Testing)

**URL:** http://localhost:3000/test-scanner (or your-domain.vercel.app/test-scanner)

### Desktop with Webcam
- [ ] Page loads without errors
- [ ] Camera dropdown shows available cameras
- [ ] Click "Start Scanner" button
- [ ] Camera feed appears in the scanner box
- [ ] Browser asks for camera permission (approve it)
- [ ] Camera feed is visible and clear
- [ ] Point camera at ISBN barcode on book
- [ ] Barcode is detected automatically
- [ ] Result shows scanned ISBN
- [ ] ISBN validation shows "Valid ISBN" checkmark
- [ ] Debug logs show scan events
- [ ] Click "Stop Scanner" - camera stops

### Mobile Browser
- [ ] Page loads on mobile
- [ ] Camera dropdown shows front/back cameras
- [ ] Click "Start Scanner" button
- [ ] Browser asks for camera permission (approve it)
- [ ] Camera feed appears (should use back camera)
- [ ] Camera autofocus works
- [ ] Point at ISBN barcode on book
- [ ] Barcode detected automatically
- [ ] Result displays scanned ISBN
- [ ] ISBN validation works
- [ ] Can switch between front/back cameras
- [ ] Camera stops when scanner stopped

## Test 2: Main Scan Page Integration

**URL:** http://localhost:3000/scan (or your-domain.vercel.app/scan)

### Scanner Button Visibility
- [ ] Page loads successfully
- [ ] "Scan Barcode" button is visible (big blue/purple button)
- [ ] Button shows "Or enter ISBN manually below" text
- [ ] ISBN input field still visible below scanner button

### Scanner Functionality
- [ ] Click "Scan Barcode" button
- [ ] Scanner opens in full-screen modal
- [ ] Header shows "Scan Barcode" and "Point camera at ISBN barcode"
- [ ] Close button (X) visible in top right
- [ ] Camera initializes automatically
- [ ] "Initializing camera..." message appears first
- [ ] Camera feed appears after initialization
- [ ] Instructions shown below camera

### Successful Scan Flow
- [ ] Point camera at ISBN barcode
- [ ] Scanner detects barcode automatically
- [ ] Scanner modal closes immediately
- [ ] ISBN populates in the ISBN input field
- [ ] Book lookup triggers automatically
- [ ] Book details appear (if found in Google Books)
- [ ] Can add book to inventory normally

### Manual Entry Fallback
- [ ] Click "Scan Barcode" button
- [ ] Scanner opens
- [ ] Click "Use Manual Entry Instead" button
- [ ] Scanner closes
- [ ] Can type ISBN manually in input field
- [ ] Manual lookup works as before

### Error Handling
- [ ] Deny camera permission
- [ ] Error message appears with clear solutions
- [ ] "Use Manual Entry" button works
- [ ] Can close scanner and use manual entry
- [ ] Manual entry works after camera denial

## Test 3: Both Methods Work Together

### Workflow 1: Scanner → Manual → Scanner
- [ ] Use scanner to add one book
- [ ] Use manual entry to add another book
- [ ] Use scanner again for third book
- [ ] All three books added successfully
- [ ] Recent books list shows all three

### Workflow 2: Manual → Scanner → Manual
- [ ] Start with manual ISBN entry
- [ ] Then use scanner for next book
- [ ] Then manual entry again
- [ ] Both methods work seamlessly

## Test 4: Edge Cases

### Invalid Barcodes
- [ ] Scan non-ISBN barcode (like UPC on random product)
- [ ] Scanner detects it but ISBN validation shows invalid
- [ ] Can still lookup or enter manually

### Poor Lighting
- [ ] Test in dim lighting
- [ ] Scanner struggles but doesn't crash
- [ ] Can use flash/improve lighting or switch to manual

### No Camera Available
- [ ] Test on device without camera (desktop without webcam)
- [ ] Error message appears immediately
- [ ] "Use Manual Entry" option available
- [ ] Manual entry works normally

### Camera Already in Use
- [ ] Open scanner in two browser tabs simultaneously
- [ ] Second tab shows appropriate error
- [ ] Can close and use manual entry

## Test 5: Mobile Specific

### iOS Safari
- [ ] Scanner works on iPhone
- [ ] Back camera selected by default
- [ ] Autofocus works properly
- [ ] Barcode detection is reliable
- [ ] No crashes or freezes

### Android Chrome
- [ ] Scanner works on Android
- [ ] Back camera selected by default
- [ ] Barcode detection works
- [ ] Performance is acceptable

### Permissions
- [ ] First time: browser asks for camera permission
- [ ] Grant permission: scanner works
- [ ] Deny permission: clear error message shown
- [ ] Revoke permission in settings: error appears on next use
- [ ] Re-grant permission: scanner works again

## Test 6: Performance

### Speed
- [ ] Scanner opens in < 2 seconds
- [ ] Barcode detection is near-instant
- [ ] Scanner closes immediately after scan
- [ ] No lag or freezing

### Memory
- [ ] Camera stream stops when scanner closes
- [ ] No memory leaks after multiple scans
- [ ] Can scan 10+ books in a row without issues

## Test 7: User Experience

### First-Time User
- [ ] Instructions are clear
- [ ] Permission request is expected
- [ ] Fallback to manual entry is obvious
- [ ] Error messages are helpful

### Returning User
- [ ] Scanner remembers camera permission
- [ ] Opens quickly (no re-permission needed)
- [ ] Smooth workflow for multiple scans

## Success Criteria

**Minimum Requirements (Must Pass):**
- ✅ Scanner opens and shows camera feed
- ✅ Can detect and scan ISBN barcodes
- ✅ Scanned ISBN populates correctly
- ✅ Automatic lookup triggers
- ✅ Manual entry still works (critical fallback)
- ✅ Works on mobile browsers
- ✅ Clear error messages when camera unavailable

**Nice to Have (Should Pass):**
- ✅ Fast performance (< 2 second open time)
- ✅ Reliable barcode detection
- ✅ Good UX with clear instructions
- ✅ Works in various lighting conditions
- ✅ Back camera auto-selected on mobile

## Known Limitations (Expected)

These are acceptable limitations:
- Camera quality depends on device
- Detection accuracy varies by lighting
- Some devices have better autofocus than others
- Browser compatibility varies
- HTTPS required for camera access

## Rollback Plan

**If scanner doesn't work well:**
1. Open `src/lib/feature-flags.ts`
2. Set `BARCODE_SCANNER: false`
3. Commit and push
4. Scanner hidden, manual entry remains

**This is the beauty of feature flags - instant rollback without breaking anything!**

## Reporting Issues

If you find bugs, note:
- Device (iPhone 16, Samsung Galaxy, etc.)
- Browser (Safari, Chrome, Edge)
- Exact error message
- What you were trying to do
- Screenshot if possible

Then I can fix specific issues without breaking what works.

