#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Update Flow...\n');

// Read current package.json version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = packageJson.version;

console.log(`📦 Current version: ${currentVersion}`);

// Check if dist folder exists
if (!fs.existsSync('dist')) {
  console.log('❌ dist/ folder not found. Run "npm run build" first.');
  process.exit(1);
}

// Check if update-manifest.json exists in dist
const manifestPath = 'dist/update-manifest.json';
if (!fs.existsSync(manifestPath)) {
  console.log('❌ update-manifest.json not found in dist/');
  console.log('   Run "npm run generate-manifest" first.');
  process.exit(1);
}

// Read the manifest
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
console.log(`📋 Manifest version: ${manifest.version}`);

// Check if version.json exists
const versionPath = 'dist/version.json';
if (!fs.existsSync(versionPath)) {
  console.log('❌ version.json not found in dist/');
  process.exit(1);
}

const versionFile = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
console.log(`📄 Version file: ${versionFile.version}`);

// Simulate version comparison
function isNewerVersion(newVersion, currentVersion) {
  const parseVersion = (version) => {
    return version.split('.').map(num => parseInt(num, 10));
  };
  
  const newParts = parseVersion(newVersion);
  const currentParts = parseVersion(currentVersion);
  
  for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
    const newPart = newParts[i] || 0;
    const currentPart = currentParts[i] || 0;
    
    if (newPart > currentPart) return true;
    if (newPart < currentPart) return false;
  }
  
  return false;
}

console.log('\n🔍 Version Comparison Test:');

// Test 1: Same version (should be false)
console.log(`   ${currentVersion} vs ${currentVersion}: ${isNewerVersion(currentVersion, currentVersion)} (should be false)`);

// Test 2: Newer version (should be true)
const testNewerVersion = currentVersion.split('.');
testNewerVersion[2] = (parseInt(testNewerVersion[2]) + 1).toString();
const newerVersion = testNewerVersion.join('.');
console.log(`   ${newerVersion} vs ${currentVersion}: ${isNewerVersion(newerVersion, currentVersion)} (should be true)`);

// Test 3: Older version (should be false)
const testOlderVersion = currentVersion.split('.');
testOlderVersion[2] = Math.max(0, parseInt(testOlderVersion[2]) - 1).toString();
const olderVersion = testOlderVersion.join('.');
console.log(`   ${olderVersion} vs ${currentVersion}: ${isNewerVersion(olderVersion, currentVersion)} (should be false)`);

console.log('\n✅ Update Flow Test Complete!');

console.log('\n📋 Next Steps:');
console.log('1. Upload dist/ folder to your domain');
console.log('2. Run: npm run verify-deployment https://yourdomain.com');
console.log('3. Test update detection in your app');

console.log('\n🔧 To create a new update:');
console.log('1. Run: npm run deploy-update');
console.log('2. Upload new dist/ folder to your domain');
console.log('3. Users will see the update available');