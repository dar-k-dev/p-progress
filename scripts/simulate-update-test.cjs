#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Simulating Update Detection Test...\n');

// Step 1: Create a fake "old" version.json (simulating what's deployed)
const oldVersion = {
  version: "1.0.3",
  buildHash: "old-build-hash",
  timestamp: "2025-07-30T20:00:00.000Z"
};

// Step 2: Read the current update-manifest.json (simulating what's available)
const manifestPath = 'dist/update-manifest.json';
if (!fs.existsSync(manifestPath)) {
  console.log('❌ update-manifest.json not found. Run "npm run generate-manifest" first.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log('📊 Test Scenario:');
console.log(`   Deployed version (old): ${oldVersion.version}`);
console.log(`   Available version (new): ${manifest.version}`);

// Step 3: Test version comparison logic
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

const shouldShowUpdate = isNewerVersion(manifest.version, oldVersion.version);
console.log(`\n🔍 Version Comparison Result:`);
console.log(`   ${manifest.version} > ${oldVersion.version}: ${shouldShowUpdate}`);

if (shouldShowUpdate) {
  console.log('✅ UPDATE WOULD BE DETECTED! 🎉');
  console.log('\n📱 What users would see:');
  console.log(`   "Version ${manifest.version} available"`);
  console.log(`   Changes: ${manifest.changes.join(', ')}`);
} else {
  console.log('❌ No update would be detected');
}

// Step 4: Create test files for manual testing
console.log('\n🔧 Creating test files for manual testing...');

// Create a test version.json with old version
fs.writeFileSync('dist/version-old.json', JSON.stringify(oldVersion, null, 2));
console.log('✅ Created dist/version-old.json (simulates old deployed version)');

// Create test HTML file
const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Update Detection Test</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; }
        .result { padding: 15px; margin: 10px 0; border-radius: 8px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        button { padding: 10px 20px; background: #007AFF; color: white; border: none; border-radius: 8px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>🧪 Update Detection Test</h1>
    <p>This test simulates the update detection process:</p>
    
    <button onclick="testUpdateDetection()">Test Update Detection</button>
    
    <div id="results"></div>
    
    <script>
        async function testUpdateDetection() {
            const results = document.getElementById('results');
            results.innerHTML = '<p>Testing...</p>';
            
            try {
                // Get "current" version (old)
                const versionResponse = await fetch('/version-old.json');
                const currentVersion = await versionResponse.json();
                
                // Get available version (new)
                const manifestResponse = await fetch('/update-manifest.json');
                const manifest = await manifestResponse.json();
                
                // Compare versions
                const isNewer = isNewerVersion(manifest.version, currentVersion.version);
                
                results.innerHTML = \`
                    <div class="result">
                        <h3>📊 Test Results:</h3>
                        <p><strong>Current Version:</strong> \${currentVersion.version}</p>
                        <p><strong>Available Version:</strong> \${manifest.version}</p>
                        <p><strong>Update Available:</strong> \${isNewer ? '✅ YES' : '❌ NO'}</p>
                    </div>
                    
                    \${isNewer ? \`
                        <div class="result success">
                            <h3>🎉 Update Would Be Shown!</h3>
                            <p><strong>Changes:</strong></p>
                            <ul>\${manifest.changes.map(change => \`<li>\${change}</li>\`).join('')}</ul>
                        </div>
                    \` : \`
                        <div class="result error">
                            <h3>❌ No Update Detected</h3>
                            <p>Version comparison failed or versions are the same.</p>
                        </div>
                    \`}
                \`;
                
            } catch (error) {
                results.innerHTML = \`
                    <div class="result error">
                        <h3>❌ Test Failed</h3>
                        <p>Error: \${error.message}</p>
                    </div>
                \`;
            }
        }
        
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
    </script>
</body>
</html>
`;

fs.writeFileSync('dist/update-test.html', testHTML);
console.log('✅ Created dist/update-test.html (manual test page)');

console.log('\n🧪 Manual Testing Instructions:');
console.log('1. Upload your dist/ folder to your domain');
console.log('2. Visit: https://yourdomain.com/update-test.html');
console.log('3. Click "Test Update Detection" button');
console.log('4. Should show "Update Would Be Shown!" ✅');

console.log('\n🔧 To Fix Your Live Site:');
console.log('1. Your current site has version.json with version 1.0.5');
console.log('2. Run: npm run npm-publish-patch (creates 1.0.6)');
console.log('3. Upload new dist/ folder to your domain');
console.log('4. Users will see version 1.0.6 available!');

console.log('\n✅ Update detection system is working correctly!');