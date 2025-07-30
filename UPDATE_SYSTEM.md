# ProgressPulse Update System

## Overview

The ProgressPulse app includes a comprehensive update system with push notifications, real-time progress tracking, and automatic update management.

## Features

- 🚀 **Push Notifications**: Users receive notifications when updates are available
- 📊 **Real-time Progress**: Download progress with speed and time remaining
- 🔄 **Auto Updates**: Optional automatic installation of updates
- 📱 **iPhone-style UI**: Premium iOS-style update interface
- 🔒 **Secure Updates**: Verified and signed update packages
- 📈 **Update History**: Track all installed updates

## How to Publish Updates

### 1. Install Dependencies

```bash
npm install
```

### 2. Update Version and Publish

For patch updates (bug fixes):
```bash
npm run version:patch
```

For minor updates (new features):
```bash
npm run version:minor
```

For major updates (breaking changes):
```bash
npm run version:major
```

### 3. Manual Update Publishing

```bash
# Build the app
npm run build

# Publish update with push notifications
npm run publish-update
```

### 4. Advanced Publishing Options

```bash
# Critical update (forces immediate installation)
npm run publish-update -- --critical

# Gradual rollout (50% of users)
npm run publish-update -- --rollout=50

# Regional rollout
npm run publish-update -- --regions=US,CA,UK
```

## Update Process Flow

1. **Developer publishes update** → Runs `npm run publish-update`
2. **Update manifest created** → `/public/update-manifest.json` updated
3. **Push notifications sent** → All subscribed users notified
4. **Users receive notification** → "🚀 Update Available" notification
5. **User clicks notification** → Redirected to Settings → Updates
6. **User clicks "Update"** → Download starts with progress bar
7. **Download completes** → Installation begins automatically
8. **Installation complete** → Success notification + app reload

## Configuration

### Environment Variables

Create a `.env` file with:

```env
# Firebase Configuration (for push notifications)
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef

# VAPID Keys for Web Push
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

### Update Manifest Structure

```json
{
  "version": "1.0.1",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "changes": [
    "Enhanced iPhone-style animations",
    "Improved update system",
    "Bug fixes and performance improvements"
  ],
  "downloadUrl": "https://your-cdn.com/updates/1.0.1",
  "size": 2847392,
  "critical": false,
  "rollout": {
    "percentage": 100,
    "regions": ["all"]
  }
}
```

## User Experience

### Update Notification
- Users receive push notification: "🚀 ProgressPulse Update Available"
- Notification includes version number and brief description
- Action buttons: "Update Now" and "Later"

### Update Interface
- iPhone-style card design with glass morphism
- Real-time progress bar with percentage
- Download speed and time remaining
- Network status indicator (WiFi/Cellular)
- Update changelog with "What's New" section

### Settings Integration
- Update button in Settings page
- Update preferences (auto-update, WiFi-only, notifications)
- Update history with version details
- Current version display

## Technical Implementation

### Components
- `UpdateButton` - Main update interface with progress
- `UpdateSettings` - User preferences and history
- `useUpdateStore` - Zustand store for update state
- `pushNotificationService` - Push notification handling
- `useUpdateInit` - Initialization hook

### Service Worker
- `sw-push.js` - Handles push notifications
- Background update checks
- Notification click handling
- Update installation management

### Scripts
- `publish-update.js` - Main publishing script
- Sends push notifications to all subscribers
- Updates Firebase with version info
- Creates update manifest

## Testing

### Local Testing

1. **Test Update Check**:
   ```bash
   # Modify version in update-manifest.json
   # Open app and go to Settings → Updates
   # Click "Check for Updates"
   ```

2. **Test Push Notifications**:
   ```bash
   # Run the app
   # Enable notifications in Settings
   # Run: npm run publish-update
   # Check for notification
   ```

3. **Test Update Flow**:
   ```bash
   # Increment version in package.json
   # Run: npm run publish-update
   # Check notification → Click → Update → Progress → Complete
   ```

## Deployment

### Production Setup

1. **Configure Firebase**:
   - Set up Firebase project
   - Enable Cloud Messaging
   - Generate VAPID keys
   - Configure environment variables

2. **Set up CDN**:
   - Upload update packages to CDN
   - Configure download URLs
   - Set up proper CORS headers

3. **Database Setup**:
   - Store user push subscriptions
   - Track update rollouts
   - Monitor update success rates

### Monitoring

- Track notification delivery rates
- Monitor update success/failure rates
- Analyze user update adoption
- Performance metrics for downloads

## Security

- All updates are verified before installation
- HTTPS required for all update downloads
- Push notifications use secure VAPID keys
- Update manifests include integrity checks

## Troubleshooting

### Common Issues

1. **Notifications not working**:
   - Check VAPID keys configuration
   - Verify Firebase setup
   - Ensure HTTPS in production

2. **Updates not downloading**:
   - Check network connectivity
   - Verify download URLs
   - Check CORS configuration

3. **Installation failures**:
   - Check service worker registration
   - Verify update package integrity
   - Check browser compatibility

### Debug Mode

Enable debug logging:
```javascript
localStorage.setItem('debug-updates', 'true');
```

## Best Practices

1. **Version Management**:
   - Use semantic versioning (semver)
   - Test updates thoroughly before publishing
   - Maintain backward compatibility

2. **User Experience**:
   - Keep update sizes reasonable
   - Provide clear changelog information
   - Allow users to control update timing

3. **Rollout Strategy**:
   - Start with small percentage rollouts
   - Monitor for issues before full rollout
   - Have rollback plan ready

4. **Communication**:
   - Clear notification messages
   - Informative progress indicators
   - Success/failure feedback

## Support

For issues or questions about the update system:
- Check the troubleshooting section
- Review browser console for errors
- Test in different browsers/devices
- Verify network connectivity and permissions