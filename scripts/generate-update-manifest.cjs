#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Read package.json to get current version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = packageJson.version;

// Generate update manifest
const updateManifest = {
  version: currentVersion,
  timestamp: new Date().toISOString(),
  changes: [
    "🚀 Enhanced APK notification support",
    "🔔 Background daily reminders",
    "📱 Auto permission requests for APK",
    "⚡ Improved performance and stability",
    "🎯 Better offline support"
  ],
  downloadUrl: `https://registry.npmjs.org/progresspulse-pwa/-/progresspulse-pwa-${currentVersion}.tgz`,
  size: 1024 * 1024 * 2, // Approximate 2MB
  critical: false,
  rollout: {
    percentage: 100,
    regions: ["global"]
  },
  buildHash: generateBuildHash(),
  deploymentTime: Date.now()
};

function generateBuildHash() {
  // Generate a hash based on current time and version
  const data = `${currentVersion}-${Date.now()}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

// Write to both public and dist directories
const manifestContent = JSON.stringify(updateManifest, null, 2);

// Write to public directory (for development)
fs.writeFileSync('public/update-manifest.json', manifestContent);
console.log('✅ Generated public/update-manifest.json');

// Write to dist directory (for production)
if (fs.existsSync('dist')) {
  fs.writeFileSync('dist/update-manifest.json', manifestContent);
  console.log('✅ Generated dist/update-manifest.json');
}

// Also create a version.json file for service worker
const versionInfo = {
  version: currentVersion,
  buildHash: updateManifest.buildHash,
  timestamp: updateManifest.timestamp
};

fs.writeFileSync('public/version.json', JSON.stringify(versionInfo, null, 2));
if (fs.existsSync('dist')) {
  fs.writeFileSync('dist/version.json', JSON.stringify(versionInfo, null, 2));
}

console.log('✅ Generated version files');
console.log(`📦 Current version: ${currentVersion}`);
console.log(`🔗 Download URL: ${updateManifest.downloadUrl}`);
console.log(`🏗️ Build hash: ${updateManifest.buildHash}`);