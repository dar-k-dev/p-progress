# APK Deployment Guide for ProgressPulse

## Issues Fixed

### 🔔 Push Notifications Not Working in APK

**Problem**: Push notifications stop working when app is converted to APK
**Root Cause**: Service worker registration and Firebase configuration issues in APK environment

**Solutions Applied**:

1. **Enhanced Service Worker Registration**
   - Added proper service worker registration in `pwa-init.ts`
   - Added fallback registration methods
   - Enhanced Firebase messaging service worker with APK-specific settings

2. **Firebase Configuration Updates**
   - Updated `firebase-messaging-sw.js` with enhanced APK support
   - Added proper error handling and fallbacks
   - Added vibration and enhanced notification options

3. **Manifest Updates**
   - Created `manifest.json` with proper permissions
   - Added `gcm_sender_id` for Firebase messaging
   - Added notification permissions

### 🔐 Fingerprint Authentication Not Working in APK

**Problem**: WebAuthn/Fingerprint setup fails in APK environment
**Root Cause**: WebAuthn API differences in WebView vs native browser

**Solutions Applied**:

1. **Enhanced WebAuthn Detection**
   - Added proper platform authenticator detection
   - Added fallback for older WebView versions
   - Enhanced error handling for APK environment

2. **Improved Credential Creation**
   - Added proper challenge generation using `crypto.getRandomValues()`
   - Added multiple algorithm support (ES256, RS256)
   - Added proper RP ID configuration for APK environment
   - Increased timeout to 60 seconds for mobile devices

3. **Better Error Handling**
   - Added specific error messages for APK environment
   - Added fallback authentication methods
   - Improved user feedback

## Deployment Steps

### 1. Build for Production
```bash
npm run build
```

### 2. Test PWA Features
Before converting to APK, test these features in browser:
- Push notifications permission
- Service worker registration
- Fingerprint authentication setup
- Offline functionality

### 3. APK Conversion Tools

#### Option A: PWA Builder (Recommended)
1. Go to https://www.pwabuilder.com/
2. Enter your PWA URL
3. Download Android package
4. Sign and distribute

#### Option B: Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap copy
npx cap open android
```

#### Option C: Cordova
```bash
npm install -g cordova
cordova create progresspulse
cordova platform add android
cordova build android
```

### 4. APK-Specific Configuration

#### Android Manifest Permissions
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="com.google.android.c2dm.permission.RECEIVE" />
```

#### WebView Configuration
Add to `MainActivity.java` or `MainActivity.kt`:
```java
// Enable JavaScript
webView.getSettings().setJavaScriptEnabled(true);

// Enable DOM storage
webView.getSettings().setDomStorageEnabled(true);

// Enable database
webView.getSettings().setDatabaseEnabled(true);

// Enable geolocation
webView.getSettings().setGeolocationEnabled(true);

// Allow mixed content (for HTTPS/HTTP)
webView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
```

## Testing in APK Environment

### 1. Push Notifications
```javascript
// Test push notification registration
const testPushNotifications = async () => {
  try {
    const permission = await Notification.requestPermission();
    console.log('Permission:', permission);
    
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker ready:', registration);
      
      // Test notification
      registration.showNotification('Test Notification', {
        body: 'Push notifications are working!',
        icon: '/pwa-192x192.png',
        vibrate: [200, 100, 200]
      });
    }
  } catch (error) {
    console.error('Push notification test failed:', error);
  }
};
```

### 2. Fingerprint Authentication
```javascript
// Test biometric authentication
const testBiometric = async () => {
  try {
    const isSupported = await navigator.credentials.isUserVerifyingPlatformAuthenticatorAvailable();
    console.log('Biometric supported:', isSupported);
    
    if (isSupported) {
      // Test credential creation
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: 'ProgressPulse', id: window.location.hostname },
          user: {
            id: new TextEncoder().encode('test-user'),
            name: 'test-user',
            displayName: 'Test User'
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          },
          timeout: 60000
        }
      });
      
      console.log('Biometric setup successful:', credential);
    }
  } catch (error) {
    console.error('Biometric test failed:', error);
  }
};
```

## Troubleshooting Common Issues

### Issue 1: Service Worker Not Registering
**Symptoms**: Push notifications don't work, offline features fail
**Solutions**:
- Check if `firebase-messaging-sw.js` is accessible
- Verify HTTPS context (required for service workers)
- Check browser console for registration errors

### Issue 2: WebAuthn Fails in WebView
**Symptoms**: Fingerprint setup throws errors
**Solutions**:
- Ensure WebView supports WebAuthn API
- Check if device has biometric hardware
- Verify secure context (HTTPS or localhost)

### Issue 3: Notifications Not Showing
**Symptoms**: Notifications permission granted but no notifications appear
**Solutions**:
- Check Android notification settings for the app
- Verify Firebase configuration
- Test with simple notification first

### Issue 4: App Crashes on Startup
**Symptoms**: APK crashes when opened
**Solutions**:
- Check WebView version compatibility
- Verify all required permissions are granted
- Check for JavaScript errors in WebView console

## Performance Optimization for APK

### 1. Reduce Bundle Size
```bash
# Analyze bundle
npm run build -- --analyze

# Use dynamic imports for large components
const LazyComponent = lazy(() => import('./LargeComponent'));
```

### 2. Optimize Images
- Use WebP format for better compression
- Implement lazy loading for images
- Use appropriate image sizes for mobile

### 3. Cache Strategy
- Implement proper service worker caching
- Use IndexedDB for offline data storage
- Minimize network requests

## Security Considerations

### 1. Content Security Policy
Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.gstatic.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://fcm.googleapis.com;
">
```

### 2. Secure Storage
- Use encrypted storage for sensitive data
- Implement proper session management
- Validate all user inputs

## Final Checklist

Before releasing APK:
- [ ] Push notifications working
- [ ] Fingerprint authentication working
- [ ] Offline functionality working
- [ ] All permissions properly configured
- [ ] App tested on multiple Android versions
- [ ] Performance optimized
- [ ] Security measures implemented
- [ ] Error handling robust
- [ ] User experience smooth

## Support

If you encounter issues:
1. Check browser console for errors
2. Test in Chrome DevTools mobile emulation
3. Verify all configuration files are correct
4. Test on actual Android device before APK conversion