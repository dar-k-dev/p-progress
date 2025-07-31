#!/usr/bin/env node

const https = require('https');
const http = require('http');
const fs = require('fs');

// Get the domain from command line argument
const domain = process.argv[2];

if (!domain) {
  console.log('❌ Please provide your domain as an argument');
  console.log('Usage: node scripts/verify-deployment.cjs https://yourdomain.com');
  process.exit(1);
}

console.log(`🔍 Verifying deployment on: ${domain}`);

// Read local version for comparison
const localVersion = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
console.log(`📦 Local version: ${localVersion}`);

// Function to make HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${error.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function verifyDeployment() {
  try {
    // Check update manifest
    console.log('\n🔍 Checking update-manifest.json...');
    const manifestUrl = `${domain}/update-manifest.json`;
    const manifest = await makeRequest(manifestUrl);
    
    console.log(`✅ Update manifest found!`);
    console.log(`   Version: ${manifest.version}`);
    console.log(`   Timestamp: ${manifest.timestamp}`);
    console.log(`   Build Hash: ${manifest.buildHash}`);
    
    // Check version.json
    console.log('\n🔍 Checking version.json...');
    const versionUrl = `${domain}/version.json`;
    const version = await makeRequest(versionUrl);
    
    console.log(`✅ Version file found!`);
    console.log(`   Version: ${version.version}`);
    console.log(`   Build Hash: ${version.buildHash}`);
    
    // Compare versions
    console.log('\n📊 Version Comparison:');
    if (manifest.version === localVersion) {
      console.log(`✅ Deployed version matches local version (${localVersion})`);
    } else {
      console.log(`⚠️  Version mismatch:`);
      console.log(`   Local: ${localVersion}`);
      console.log(`   Deployed: ${manifest.version}`);
    }
    
    // Check service workers
    console.log('\n🔍 Checking service workers...');
    
    try {
      await makeRequest(`${domain}/sw.js`);
      console.log(`✅ Main service worker (sw.js) accessible`);
    } catch (error) {
      console.log(`❌ Main service worker not found: ${error.message}`);
    }
    
    try {
      await makeRequest(`${domain}/sw-notifications.js`);
      console.log(`✅ Notification service worker (sw-notifications.js) accessible`);
    } catch (error) {
      console.log(`❌ Notification service worker not found: ${error.message}`);
    }
    
    // Final status
    console.log('\n🎉 DEPLOYMENT VERIFICATION COMPLETE!');
    console.log('\n📱 Next Steps:');
    console.log('1. Users can now check for updates in Settings → Updates');
    console.log('2. Background notifications will work for APK users');
    console.log('3. Daily reminders will be sent at scheduled times');
    console.log('4. Update notifications will appear automatically');
    
    console.log('\n🧪 Test Update Detection:');
    console.log('1. Open your app in browser');
    console.log('2. Go to Settings → Updates');
    console.log('3. Click "Check for Updates"');
    console.log(`4. Should detect version ${manifest.version}`);
    
  } catch (error) {
    console.log(`❌ Deployment verification failed: ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure all files from dist/ are uploaded to your domain');
    console.log('2. Check that update-manifest.json is accessible');
    console.log('3. Verify your domain URL is correct');
    console.log('4. Wait a few minutes for CDN cache to clear');
  }
}

verifyDeployment();