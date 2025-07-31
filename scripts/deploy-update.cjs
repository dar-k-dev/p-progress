#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting deployment process...');

// Step 1: Increment version
console.log('📦 Incrementing version...');
execSync('npm version patch', { stdio: 'inherit' });

// Step 2: Generate update manifest
console.log('📝 Generating update manifest...');
execSync('node scripts/generate-update-manifest.cjs', { stdio: 'inherit' });

// Step 3: Build the project
console.log('🏗️ Building project...');
execSync('npm run build', { stdio: 'inherit' });

// Step 4: Regenerate manifest for dist (in case build overwrote it)
console.log('🔄 Regenerating manifest for dist...');
execSync('node scripts/generate-update-manifest.cjs', { stdio: 'inherit' });

// Step 5: Publish to NPM
console.log('📤 Publishing to NPM...');
execSync('npm publish', { stdio: 'inherit' });

// Step 6: Create deployment instructions
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const newVersion = packageJson.version;

const deploymentInstructions = `
🎉 DEPLOYMENT COMPLETE - Version ${newVersion}

📁 FILES TO UPLOAD TO YOUR DOMAIN:
   Upload the entire 'dist/' folder contents to your web server

🔗 CRITICAL FILES FOR UPDATES:
   ✅ dist/update-manifest.json  (Contains version info)
   ✅ dist/version.json          (For service worker)
   ✅ dist/sw-notifications.js   (Background notifications)
   ✅ dist/sw.js                 (Main service worker)

🌐 DEPLOYMENT STEPS:
   1. Upload all files from 'dist/' to your domain
   2. Ensure update-manifest.json is accessible at: https://yourdomain.com/update-manifest.json
   3. Test by visiting: https://yourdomain.com/update-manifest.json
   4. Users will automatically get update notifications within 24 hours

🧪 TESTING UPDATES:
   1. Deploy this version to your domain
   2. Wait 5 minutes for CDN cache to clear
   3. Open your app in browser
   4. Go to Settings → Updates → Check for Updates
   5. Should show version ${newVersion} available

📱 APK USERS:
   - Will receive background notifications about the update
   - Can update by visiting your domain in their APK browser
   - Or download new APK from PWA Builder with this version

🔔 NOTIFICATION TESTING:
   - Daily reminders will work in background
   - Update notifications will appear automatically
   - Test notifications work immediately

✅ Your app is now ready for production deployment!
`;

console.log(deploymentInstructions);

// Write instructions to file
fs.writeFileSync('DEPLOYMENT_INSTRUCTIONS.txt', deploymentInstructions);
console.log('📄 Deployment instructions saved to DEPLOYMENT_INSTRUCTIONS.txt');