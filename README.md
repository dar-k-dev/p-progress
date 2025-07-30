# 🎯 ProgressPulse PWA

A modern, iPhone-style Progressive Web App for tracking progress and achieving goals with real-time updates and push notifications.

[![NPM Version](https://img.shields.io/npm/v/progresspulse-pwa.svg)](https://www.npmjs.com/package/progresspulse-pwa)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

## ✨ Features

- 🎨 **iPhone-Style Design** - Glass morphism, smooth animations, haptic feedback
- 🔄 **Real-time Updates** - Automatic app updates with progress tracking
- 🔔 **Push Notifications** - Web push notifications for updates and reminders
- 📱 **PWA Ready** - Installable, offline-capable, APK-convertible
- 🔒 **Biometric Auth** - WebAuthn fingerprint/face authentication
- 📊 **Progress Tracking** - Goals, achievements, analytics, calendar
- 🌙 **Dark Mode** - System-aware theme switching
- ⚡ **Performance** - Optimized for mobile and desktop

## 🚀 Quick Start

### Install from NPM

```bash
# Install the complete source code
npm install progresspulse-pwa

# Navigate to the installed package
cd node_modules/progresspulse-pwa

# Install dependencies
npm install

# Start development server
npm run dev
```

### Or Clone and Run

```bash
# Clone the repository
git clone https://github.com/your-username/progresspulse-pwa.git
cd progresspulse-pwa

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📦 What's Included

When you install this package, you get the **complete source code**:

```
progresspulse-pwa/
├── src/                    # Complete React TypeScript source
│   ├── components/         # UI components with iPhone-style design
│   ├── pages/             # Application pages
│   ├── hooks/             # Custom React hooks
│   ├── stores/            # Zustand state management
│   ├── services/          # Push notifications, updates
│   └── lib/               # Utilities, PWA initialization
├── public/                # Static assets, manifest, service workers
├── scripts/               # Update publishing automation
├── dist/                  # Built application (after npm run build)
└── Configuration files    # Vite, TypeScript, Tailwind, etc.
```

## 🎯 Use Cases

### 1. **Ready-to-Deploy PWA**
```bash
npm install progresspulse-pwa
cd node_modules/progresspulse-pwa
npm install && npm run build
# Deploy dist/ folder to your hosting
```

### 2. **Development Template**
```bash
npm install progresspulse-pwa
cp -r node_modules/progresspulse-pwa/* ./my-project/
cd my-project
npm install
# Customize and develop
```

### 3. **Learning Resource**
- Study iPhone-style React components
- Learn PWA implementation patterns
- Understand push notification setup
- Explore update system architecture

## 🔄 Update System

The app includes a complete **iPhone-style update system**:

### For Users:
- 🔔 Push notifications when updates are available
- 📱 iPhone-style update interface in Settings
- ⚡ Real-time download progress with speed tracking
- 🎨 Smooth animations and haptic feedback simulation

### For Developers:
```bash
# Publish app updates (sends push notifications to all users)
npm run version:patch    # Bug fixes (1.0.0 → 1.0.1)
npm run version:minor    # New features (1.0.0 → 1.1.0)
npm run version:major    # Breaking changes (1.0.0 → 2.0.0)

# Manual update publishing
npm run publish-update

# Test the update system
npm run demo-update && npm run dev
# Go to Settings → Updates → "Check for Updates"
```

## 🔔 Push Notifications

Built-in Web Push notification system:

- **Firebase Cloud Messaging** integration
- **VAPID keys** for web push
- **Service worker** for background notifications
- **Interactive notifications** with action buttons
- **Cross-platform** support (desktop, mobile, PWA)

## 📱 PWA Features

- **Installable** on all platforms
- **Offline capable** with service worker caching
- **APK convertible** using PWA Builder, Capacitor, or Cordova
- **Biometric authentication** with WebAuthn
- **Native-like experience** with iPhone-style UI

## 🛠️ Development

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run test             # Run tests
npm run lint             # Lint code

# Update system
npm run demo-update      # Create demo update for testing
npm run test-update      # Validate update system
npm run publish-update   # Publish update to users

# NPM publishing
npm run npm-publish      # Publish to NPM
npm run npm-publish-patch # Version bump + publish
```

### Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **Radix UI** for accessible components
- **Firebase** for push notifications
- **Workbox** for service worker

## 🎨 iPhone-Style Components

The app includes custom iPhone-style components:

```tsx
import { IOSCard, IOSButton, IOSProgress } from '@/components/ui';

// Glass morphism card
<IOSCard variant="glass" interactive>
  <IOSCardHeader>
    <IOSCardTitle>Update Available</IOSCardTitle>
  </IOSCardHeader>
  <IOSCardContent>
    <IOSProgress value={75} showSpeed showTimeRemaining />
  </IOSCardContent>
</IOSCard>

// iPhone-style button
<IOSButton variant="primary" size="lg" haptic>
  Update Now
</IOSButton>
```

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# VAPID Keys for Web Push
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

### Quick Setup

```bash
# Generate production setup files
npm run setup-production

# This creates:
# - .env.example (environment variables template)
# - DEPLOYMENT.md (deployment checklist)
```

## 📚 Documentation

- **UPDATE_SYSTEM.md** - Complete update system guide
- **DEPLOYMENT.md** - Production deployment checklist
- **APK_DEPLOYMENT_GUIDE.md** - Convert to Android APK
- **QUICK_START.md** - Quick start guide

## 🚀 Deployment

### Web Hosting
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

### APK Conversion
```bash
# Option 1: PWA Builder (Recommended)
# Go to https://www.pwabuilder.com/
# Enter your PWA URL and download APK

# Option 2: Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap copy && npx cap open android
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 What You Get

When you install `progresspulse-pwa`, you get:

✅ **Complete source code** - Modify anything you want  
✅ **iPhone-style UI components** - Ready-to-use design system  
✅ **Real-time update system** - Push notifications to users  
✅ **PWA ready** - Installable and offline-capable  
✅ **Biometric authentication** - WebAuthn integration  
✅ **Production ready** - Optimized and tested  
✅ **Full documentation** - Guides and examples  
✅ **TypeScript** - Type-safe development  
✅ **Modern tooling** - Vite, Tailwind, Framer Motion  

## 🔗 Links

- **NPM Package**: https://www.npmjs.com/package/progresspulse-pwa
- **GitHub Repository**: https://github.com/your-username/progresspulse-pwa
- **Live Demo**: https://progresspulse.app
- **Documentation**: https://progresspulse.app/docs

---

**Made with ❤️ by the ProgressPulse Team**

*Transform your productivity with iPhone-style design and real-time updates!*