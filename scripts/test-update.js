#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🧪 Testing ProgressPulse Update System\n');

// Test 1: Create a test update manifest
console.log('1️⃣ Creating test update manifest...');

const testUpdateManifest = {
  version: "1.0.1",
  timestamp: new Date().toISOString(),
  changes: [
    "🎨 Enhanced iPhone-style animations and transitions",
    "🔄 Added comprehensive update system with push notifications",
    "📊 Real-time progress tracking for downloads",
    "⚡ Performance optimizations and bug fixes",
    "🔒 Improved security and offline support"
  ],
  downloadUrl: "https://progresspulse.app/updates/1.0.1",
  size: Math.floor(Math.random() * 5000000) + 1000000, // Random size 1-6MB
  critical: false,
  rollout: {
    percentage: 100,
    regions: ["all"]
  }
};

try {
  writeFileSync(
    join(projectRoot, 'public', 'update-manifest.json'),
    JSON.stringify(testUpdateManifest, null, 2)
  );
  console.log('✅ Test update manifest created successfully');
} catch (error) {
  console.error('❌ Failed to create test manifest:', error.message);
}

// Test 2: Simulate push notification payload
console.log('\n2️⃣ Simulating push notification payload...');

const pushPayload = {
  title: '🚀 ProgressPulse Update Available',
  body: `Version ${testUpdateManifest.version} is ready to install`,
  icon: '/icons/icon-192x192.png',
  badge: '/icons/badge-72x72.png',
  data: {
    type: 'update',
    version: testUpdateManifest.version,
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
  requireInteraction: testUpdateManifest.critical,
  silent: false,
  vibrate: [200, 100, 200]
};

console.log('📱 Push notification payload:');
console.log(JSON.stringify(pushPayload, null, 2));

// Test 3: Validate update system components
console.log('\n3️⃣ Validating update system components...');

const componentsToCheck = [
  'src/stores/useUpdateStore.ts',
  'src/components/updates/UpdateButton.tsx',
  'src/components/updates/UpdateSettings.tsx',
  'src/services/pushNotificationService.ts',
  'src/hooks/useUpdateInit.ts',
  'public/sw-push.js',
  'public/update-manifest.json'
];

let allComponentsExist = true;

componentsToCheck.forEach(component => {
  try {
    const filePath = join(projectRoot, component);
    readFileSync(filePath);
    console.log(`✅ ${component}`);
  } catch (error) {
    console.log(`❌ ${component} - Missing or inaccessible`);
    allComponentsExist = false;
  }
});

// Test 4: Package.json validation
console.log('\n4️⃣ Validating package.json configuration...');

try {
  const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
  
  const requiredScripts = [
    'publish-update',
    'version:patch',
    'version:minor',
    'version:major',
    'deploy'
  ];
  
  const requiredDependencies = [
    'web-push',
    'node-fetch',
    'semver'
  ];
  
  console.log('📦 Checking scripts...');
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      console.log(`✅ Script: ${script}`);
    } else {
      console.log(`❌ Script: ${script} - Missing`);
      allComponentsExist = false;
    }
  });
  
  console.log('\n📦 Checking dependencies...');
  requiredDependencies.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ Dependency: ${dep} v${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ Dependency: ${dep} - Missing`);
      allComponentsExist = false;
    }
  });
  
  console.log(`\n📋 Current version: ${packageJson.version}`);
  console.log(`📋 Package name: ${packageJson.name}`);
  console.log(`📋 Private: ${packageJson.private}`);
  
} catch (error) {
  console.error('❌ Failed to validate package.json:', error.message);
  allComponentsExist = false;
}

// Test 5: Environment check
console.log('\n5️⃣ Environment check...');

const envVars = [
  'VAPID_PUBLIC_KEY',
  'VAPID_PRIVATE_KEY',
  'FIREBASE_API_KEY',
  'FIREBASE_PROJECT_ID'
];

console.log('🔐 Environment variables:');
envVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`⚠️  ${envVar}: Not set (using defaults for demo)`);
  }
});

// Final summary
console.log('\n📊 Test Summary');
console.log('================');

if (allComponentsExist) {
  console.log('🎉 All update system components are properly configured!');
  console.log('\n🚀 Ready to test update flow:');
  console.log('1. Start the app: npm run dev');
  console.log('2. Go to Settings → Updates');
  console.log('3. Click "Check for Updates"');
  console.log('4. Test the update flow');
  console.log('\n📤 To publish a real update:');
  console.log('npm run version:patch  # For bug fixes');
  console.log('npm run version:minor  # For new features');
  console.log('npm run version:major  # For breaking changes');
} else {
  console.log('❌ Some components are missing or misconfigured');
  console.log('Please check the errors above and fix them');
}

console.log('\n📚 For detailed instructions, see UPDATE_SYSTEM.md');
console.log('🔧 For troubleshooting, enable debug mode in browser console:');
console.log('localStorage.setItem("debug-updates", "true")');