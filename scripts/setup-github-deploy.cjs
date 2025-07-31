#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up GitHub repository and Vercel deployment...\n');

// Check if git is installed
try {
  execSync('git --version', { stdio: 'ignore' });
} catch (error) {
  console.log('❌ Git is not installed. Please install Git first.');
  console.log('   Download from: https://git-scm.com/download/windows');
  process.exit(1);
}

// Initialize git repository
console.log('📁 Initializing Git repository...');
try {
  execSync('git init', { stdio: 'inherit' });
  console.log('✅ Git repository initialized');
} catch (error) {
  console.log('⚠️ Git already initialized or error occurred');
}

// Create .gitignore for the project
const gitignore = `
# Dependencies
node_modules/
.pnpm-debug.log*

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# Firebase
.firebase/
firebase-debug.log

# Vercel
.vercel
`;

fs.writeFileSync('.gitignore', gitignore.trim());
console.log('✅ Created .gitignore file');

// Create vercel.json for proper deployment
const vercelConfig = {
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/sw-notifications.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/update-manifest.json",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/version.json",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
};

fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
console.log('✅ Created vercel.json configuration');

// Create README for GitHub
const readme = `# 📱 ProgressPulse PWA

A modern Progressive Web App for tracking progress and achieving goals with iPhone-style design.

## 🚀 Features

- 📊 **Progress Tracking** - Visual progress charts and analytics
- 🎯 **Goal Management** - Create and track personal goals
- 🔔 **Smart Notifications** - Daily reminders and update alerts
- 📱 **PWA Support** - Install as native app on any device
- 🌙 **Dark Mode** - Beautiful dark/light theme switching
- 📈 **Analytics** - Detailed progress insights and reports
- 🏆 **Achievements** - Unlock achievements as you progress
- 📄 **PDF Export** - Export progress reports and certificates

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **State**: Zustand + React Hook Form
- **Charts**: Recharts + D3
- **PWA**: Workbox + Web Push API
- **Database**: IndexedDB + Firebase (optional)

## 🚀 Live Demo

Visit: [https://progresspulse-pwa.vercel.app](https://progresspulse-pwa.vercel.app)

## 📱 Install as App

### On Mobile:
1. Open the website in your browser
2. Tap "Add to Home Screen" when prompted
3. Enjoy the native app experience!

### On Desktop:
1. Look for the install icon in your browser's address bar
2. Click "Install ProgressPulse"
3. Use it like a desktop application!

## 🔔 Notifications

- **Daily Reminders**: Get motivated with daily progress reminders
- **Update Alerts**: Automatic notifications when new features are available
- **Achievement Unlocks**: Celebrate your milestones

## 🏗️ Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
\`\`\`

## 📦 Deployment

This app is automatically deployed to Vercel on every push to main branch.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Inspired by iOS design principles
- PWA best practices implemented throughout

---

**Start tracking your progress today! 🚀**
`;

fs.writeFileSync('README.md', readme);
console.log('✅ Created README.md');

// Add all files to git
console.log('\n📦 Adding files to Git...');
try {
  execSync('git add .', { stdio: 'inherit' });
  console.log('✅ Files added to Git');
} catch (error) {
  console.log('❌ Error adding files to Git:', error.message);
}

// Create initial commit
console.log('\n💾 Creating initial commit...');
try {
  execSync('git commit -m "🚀 Initial commit - ProgressPulse PWA v1.0.9"', { stdio: 'inherit' });
  console.log('✅ Initial commit created');
} catch (error) {
  console.log('❌ Error creating commit:', error.message);
}

console.log('\n🎉 Repository setup complete!');
console.log('\n📋 Next Steps:');
console.log('1. Create a new repository on GitHub:');
console.log('   - Go to: https://github.com/new');
console.log('   - Repository name: progresspulse-pwa');
console.log('   - Make it public');
console.log('   - Don\'t initialize with README (we already have one)');
console.log('');
console.log('2. Connect your local repo to GitHub:');
console.log('   git remote add origin https://github.com/YOUR_USERNAME/progresspulse-pwa.git');
console.log('   git branch -M main');
console.log('   git push -u origin main');
console.log('');
console.log('3. Deploy to Vercel:');
console.log('   - Go to: https://vercel.com/new');
console.log('   - Import your GitHub repository');
console.log('   - Vercel will auto-detect settings from vercel.json');
console.log('   - Click Deploy!');
console.log('');
console.log('4. Your app will be live at: https://progresspulse-pwa.vercel.app');
console.log('');
console.log('🔔 After deployment, users will automatically get update notifications!');