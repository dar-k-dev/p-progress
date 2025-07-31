# 🚀 **GitHub + Vercel Deployment Guide**

## **Step 1: Install Git (Required)**

1. **Download Git**: https://git-scm.com/download/windows
2. **Install with default settings**
3. **Restart your terminal/PowerShell**

## **Step 2: Setup Repository (After Git is installed)**

```bash
# Run this after installing Git
npm run setup-github
```

## **Step 3: Create GitHub Repository**

1. **Go to**: https://github.com/new
2. **Repository name**: `progresspulse-pwa`
3. **Make it Public**
4. **Don't initialize with README** (we already have one)
5. **Click "Create repository"**

## **Step 4: Connect Local to GitHub**

```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/progresspulse-pwa.git
git branch -M main
git push -u origin main
```

## **Step 5: Deploy to Vercel**

1. **Go to**: https://vercel.com/new
2. **Sign in with GitHub**
3. **Import your `progresspulse-pwa` repository**
4. **Vercel will auto-detect settings** (thanks to our `vercel.json`)
5. **Click "Deploy"**
6. **Your app will be live at**: `https://progresspulse-pwa.vercel.app`

## **Step 6: Test Update System**

After deployment:
1. **Your live app will have version 1.0.9**
2. **Run**: `npm run npm-publish-patch` (creates 1.0.10)
3. **Push to GitHub**: `git add . && git commit -m "Update to 1.0.10" && git push`
4. **Vercel auto-deploys the new version**
5. **Users get update notifications automatically!** ✅

---

## **🔥 Alternative: Manual Upload (If Git Issues)**

If you can't install Git right now, here's a manual approach:

### **Create Repository Manually:**
1. Go to https://github.com/new
2. Create `progresspulse-pwa` repository
3. Upload files manually using GitHub's web interface

### **Files to Upload:**
- All source files (src/, public/, package.json, etc.)
- **Don't upload dist/ folder** (Vercel builds it automatically)
- Include the `vercel.json` file I created

### **Deploy to Vercel:**
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Deploy!

---

## **🎯 Why This Works Better Than Manual Upload:**

✅ **Automatic builds** - Vercel builds your app from source  
✅ **Automatic deployments** - Push to GitHub = instant deploy  
✅ **Update notifications work** - Version files are generated correctly  
✅ **APK notifications work** - Service workers are properly configured  
✅ **No manual file management** - Everything is automated  

---

## **🔔 Update Workflow After Setup:**

```bash
# Create new version
npm run npm-publish-patch

# Push to GitHub (triggers Vercel deployment)
git add .
git commit -m "Update to v$(node -p "require('./package.json').version")"
git push

# Users automatically get update notifications! 🎉
```

**This is the REAL solution - no more manual uploads!** 🚀