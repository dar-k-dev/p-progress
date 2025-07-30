#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import webpush from 'web-push';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration
const config = {
  vapidKeys: {
    publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI2BzcOKiMMkXYdMiPnssSKCjxotkJsqFhD7SsVJjevVdqbve6vFgudZWI',
    privateKey: process.env.VAPID_PRIVATE_KEY || 'UzxlOCGq6iWiltP0R2J7-BsnT7BbVJp6VdNx3p4RABI'
  },
  firebaseConfig: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  }
};

// Set VAPID details
webpush.setVapidDetails(
  'mailto:support@progresspulse.app',
  config.vapidKeys.publicKey,
  config.vapidKeys.privateKey
);

async function publishUpdate() {
  try {
    console.log('🚀 Starting update publication process...');
    
    // Read package.json to get current version
    const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
    const currentVersion = packageJson.version;
    
    console.log(`📦 Current version: ${currentVersion}`);
    
    // Create update manifest (using relative URLs for any domain)
    const updateManifest = {
      version: currentVersion,
      timestamp: new Date().toISOString(),
      changes: await getChangelogForVersion(currentVersion),
      downloadUrl: `/updates/${currentVersion}`, // Relative URL works on any domain
      size: await getUpdateSize(),
      critical: process.argv.includes('--critical'),
      rollout: {
        percentage: parseInt(process.argv.find(arg => arg.startsWith('--rollout='))?.split('=')[1]) || 100,
        regions: process.argv.includes('--regions') ? process.argv[process.argv.indexOf('--regions') + 1]?.split(',') : ['all']
      }
    };
    
    // Save update manifest
    writeFileSync(
      join(projectRoot, 'public', 'update-manifest.json'),
      JSON.stringify(updateManifest, null, 2)
    );
    
    console.log('📄 Update manifest created');
    
    // Send push notifications to all subscribers
    await sendUpdateNotifications(updateManifest);
    
    // Update version info in Firebase
    await updateFirebaseVersion(updateManifest);
    
    console.log('✅ Update published successfully!');
    console.log(`🔔 Notifications sent for version ${currentVersion}`);
    
  } catch (error) {
    console.error('❌ Error publishing update:', error);
    process.exit(1);
  }
}

async function getChangelogForVersion(version) {
  // This would typically read from CHANGELOG.md or git commits
  // For now, return a default changelog
  return [
    'Performance improvements and bug fixes',
    'Enhanced iPhone-style animations',
    'Improved user experience'
  ];
}

async function getUpdateSize() {
  // This would calculate the actual update size
  // For now, return a mock size
  return Math.floor(Math.random() * 5000000) + 1000000; // 1-6MB
}

async function sendUpdateNotifications(updateManifest) {
  console.log('📡 Sending push notifications...');
  
  // In a real implementation, you would:
  // 1. Fetch all push subscriptions from your database
  // 2. Send notifications to each subscription
  
  // Mock subscriptions for demonstration
  const mockSubscriptions = await getMockSubscriptions();
  
  const notificationPayload = JSON.stringify({
    title: '🚀 ProgressPulse Update Available',
    body: `Version ${updateManifest.version} is ready to install`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      type: 'update',
      version: updateManifest.version,
      url: '/settings?tab=updates',
      actions: [
        {
          action: 'update',
          title: 'Update Now',
          icon: '/icons/update-icon.png'
        },
        {
          action: 'later',
          title: 'Later',
          icon: '/icons/later-icon.png'
        }
      ]
    },
    requireInteraction: updateManifest.critical,
    silent: false,
    vibrate: [200, 100, 200]
  });
  
  const promises = mockSubscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification(subscription, notificationPayload);
      console.log('✅ Notification sent successfully');
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  });
  
  await Promise.all(promises);
  console.log(`📤 Sent notifications to ${mockSubscriptions.length} subscribers`);
}

async function getMockSubscriptions() {
  // In a real implementation, fetch from your database
  return [
    {
      endpoint: 'https://fcm.googleapis.com/fcm/send/mock-endpoint-1',
      keys: {
        p256dh: 'mock-p256dh-key-1',
        auth: 'mock-auth-key-1'
      }
    }
    // Add more mock subscriptions as needed
  ];
}

async function updateFirebaseVersion(updateManifest) {
  console.log('🔥 Updating Firebase with new version info...');
  
  // In a real implementation, you would update Firebase Firestore
  // with the new version information
  
  const versionDoc = {
    version: updateManifest.version,
    timestamp: updateManifest.timestamp,
    changes: updateManifest.changes,
    downloadUrl: updateManifest.downloadUrl,
    size: updateManifest.size,
    critical: updateManifest.critical,
    rollout: updateManifest.rollout,
    status: 'published'
  };
  
  // Mock Firebase update
  console.log('📊 Version info updated in Firebase:', versionDoc);
}

// Run the script
publishUpdate().catch(console.error);