# 🚀 ShieldSight Deployment Guide
## Step-by-Step Production Deployment

---

## 📅 Deployment Timeline (3-4 Weeks)

### Week 1: Optimization & Testing
- Days 1-3: Performance optimization
- Days 4-5: SEO implementation
- Days 6-7: Logo updates & testing

### Week 2: Staging Deployment
- Days 1-2: Backend deployment (Railway)
- Days 3-4: Frontend deployment (Vercel)
- Days 5-7: Testing & bug fixes

### Week 3: Production Launch
- Days 1-2: DNS configuration
- Days 3-4: Final testing
- Days 5: Production launch
- Days 6-7: Monitoring & optimization

### Week 4: Marketing & SEO
- Submit to search engines
- Launch marketing campaigns
- Monitor analytics
- Gather feedback

---

## 📋 Prerequisites Checklist

Before starting deployment:

```bash
✓ GitHub account created
✓ Vercel account created (free)
✓ Railway account created (free)
✓ Domain purchased (optional but recommended)
✓ Firebase project created (for auth)
✓ Git installed locally
✓ Node.js v18+ installed
✓ Python 3.9+ installed
```

---

## WEEK 1: OPTIMIZATION & PREPARATION

### Day 1-2: Performance Optimization

#### Step 1: Setup Project Structure

```bash
# Navigate to your project
cd /path/to/shieldsight

# Verify structure
ls -la
# Should see: frontend/, backend/, README.md, etc.

# Create scripts directory
mkdir -p scripts
```

#### Step 2: Run Performance Tests

```bash
# Copy performance script (from previous artifact)
# Place optimize_performance.js in scripts/

# Make it executable
chmod +x scripts/optimize_performance.js

# Install dependencies
cd frontend
npm install

# Build the project
npm run build

# Run performance analysis
cd ..
node scripts/optimize_performance.js
```

**Expected Output:**
```
🚀 SHIELDSIGHT PERFORMANCE OPTIMIZATION TOOL
═══════════════════════════════════════════════

📦 Analyzing Bundle Size...
─────────────────────────────────────────────
File Name                                     Size           Type
─────────────────────────────────────────────
index-abc123.js                              245.5 KB       JavaScript
vendor-def456.js                             180.2 KB       JavaScript
index-ghi789.css                              45.3 KB       CSS
─────────────────────────────────────────────
Total Bundle Size: 0.47 MB (470.5 KB)

✅ Performance analysis complete!
```

#### Step 3: Implement Code Splitting

**frontend/src/App.tsx:**
```typescript
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const URLScanner = lazy(() => import('./pages/URLScanner'));
const BatchScanner = lazy(() => import('./pages/BatchScanner'));
const QRScanner = lazy(() => import('./pages/QRScanner'));
const DocumentScanner = lazy(() => import('./pages/DocumentScanner'));
const EmailScanner = lazy(() => import('./pages/EmailScanner'));

// Loading component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scan" element={<URLScanner />} />
          <Route path="/batch" element={<BatchScanner />} />
          <Route path="/qr" element={<QRScanner />} />
          <Route path="/document" element={<DocumentScanner />} />
          <Route path="/email" element={<EmailScanner />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
```

#### Step 4: Optimize Vite Config

**frontend/vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'ui-vendor': ['framer-motion', 'zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
  },
});
```

```bash
# Install compression plugin
npm install vite-plugin-compression --save-dev

# Rebuild
npm run build
```

### Day 3-4: SEO Implementation

#### Step 1: Update index.html

```bash
# Open frontend/index.html in your editor
nano frontend/index.html
```

Replace the entire `<head>` section with the optimized version from PRE_DEPLOYMENT_PLAN.md (Section 2.1.A).

**Key changes:**
- Update `<title>` to: "ShieldSight - AI-Powered Phishing Detection | 95.2% Accuracy"
- Add complete meta description
- Add Open Graph tags
- Add Twitter Card tags
- Add JSON-LD structured data

#### Step 2: Create Sitemap

**frontend/public/sitemap.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://shieldsight.tech/</loc>
    <lastmod>2026-02-12</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://shieldsight.tech/scan</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://shieldsight.tech/batch</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

#### Step 3: Create robots.txt

**frontend/public/robots.txt:**
```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://shieldsight.tech/sitemap.xml
```

#### Step 4: Add Google Analytics

```bash
# Get your Google Analytics ID from analytics.google.com
# Create a new GA4 property if you don't have one

# Update index.html with your GA ID
# Replace G-XXXXXXXXXX with your actual ID
```

### Day 5-6: Logo & Branding Updates

#### Step 1: Generate Logos

```bash
# Run logo generation script
python3 scripts/generate_logos.py
```

**Expected Output:**
```
🎨 Generating ShieldSight logos...
✓ Generated favicon-16.png (16x16)
✓ Generated favicon-32.png (32x32)
✓ Generated apple-touch-icon.png (180x180)
✓ Generated android-chrome-192.png (192x192)
✓ Generated android-chrome-512.png (512x512)
✓ Generated og-image.png (1200x630)
✓ Generated twitter-image.png (1200x675)
✓ Generated logo.svg (scalable)

✅ All logos generated successfully!
📁 Output directory: public/logos
```

#### Step 2: Move Logos to Frontend

```bash
# Copy generated logos
cp -r public/logos/* frontend/public/

# Verify
ls -la frontend/public/
```

#### Step 3: Update Logo References

```bash
# Find all logo references
cd frontend/src
grep -r "claude" . --ignore-case

# Update each file:
# Old: import logo from './claude-logo.svg'
# New: import logo from '/logo.svg'
```

**Example - src/components/Header.tsx:**
```typescript
import logo from '/logo.svg';

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <img 
          src={logo} 
          alt="ShieldSight - AI Phishing Detection" 
          width="180" 
          height="50"
          className="h-12 w-auto"
        />
      </div>
    </header>
  );
}
```

#### Step 4: Update manifest.json

**frontend/public/manifest.json:**
```json
{
  "name": "ShieldSight - Phishing Detection",
  "short_name": "ShieldSight",
  "description": "AI-powered phishing detection and URL security scanner",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/android-chrome-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/android-chrome-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Day 7: Local Testing

```bash
# Install testing tools
npm install -g lighthouse

# Start dev server
cd frontend
npm run dev

# In another terminal, run Lighthouse
lighthouse http://localhost:5173 --view

# Target scores:
# Performance: > 90
# Accessibility: > 95  
# Best Practices: > 90
# SEO: > 95
```

**Fix any issues reported by Lighthouse before proceeding.**

---

## WEEK 2: STAGING DEPLOYMENT

### Backend Deployment (Railway)

#### Day 1: Prepare Backend

```bash
cd backend

# Create requirements.txt if not exists
pip freeze > requirements.txt

# Create runtime.txt (specify Python version)
echo "python-3.9.18" > runtime.txt

# Create Procfile
echo "web: uvicorn app.main:app --host 0.0.0.0 --port \$PORT" > Procfile
```

#### Day 2: Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Set project name
railway variables set PROJECT_NAME=shieldsight-backend

# Add environment variables
railway variables set PORT=8000
railway variables set LOG_LEVEL=INFO
railway variables set CORS_ORIGINS=https://shieldsight-staging.vercel.app

# Deploy
railway up

# Get deployment URL
railway domain
```

**Note the deployment URL (e.g., https://shieldsight-backend.railway.app)**

#### Verify Backend

```bash
# Test health endpoint
curl https://shieldsight-backend.railway.app/health

# Expected response:
# {"status": "healthy", "timestamp": "..."}
```

### Frontend Deployment (Vercel)

#### Day 3: Prepare Frontend

```bash
cd frontend

# Create .env.production
cat > .env.production << EOF
VITE_API_URL=https://shieldsight-backend.railway.app
VITE_APP_ENV=production
EOF

# Test build
npm run build

# Test preview
npm run preview
```

#### Day 4: Deploy to Vercel

**Option 1: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# For production
vercel --prod
```

**Option 2: Via Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Connect your GitHub account
4. Select your ShieldSight repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add Environment Variables:
   ```
   VITE_API_URL = https://shieldsight-backend.railway.app
   VITE_APP_ENV = production
   ```
7. Click "Deploy"

**Note the deployment URL (e.g., https://shieldsight.vercel.app)**

#### Day 5-7: Testing

```bash
# Test all features on staging:
# 1. URL Scanner
curl -X POST https://shieldsight-backend.railway.app/predict/ \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'

# 2. Frontend
# Visit https://shieldsight.vercel.app
# Test each feature:
  - Single URL scan
  - Batch processing
  - QR code scanner
  - Document scanner
  - Email scanner
  - Dashboard
```

**Create a testing checklist:**
```
✓ Homepage loads
✓ URL scanner works
✓ Batch scanner accepts file upload
✓ QR scanner decodes QR codes
✓ Document scanner extracts URLs
✓ Email scanner parses emails
✓ Dashboard shows statistics
✓ Dark/light theme toggle works
✓ Mobile responsive
✓ All links work
✓ Forms validate input
✓ Error handling works
✓ No console errors
```

---

## WEEK 3: PRODUCTION LAUNCH

### Day 1-2: Domain Configuration

#### Step 1: Purchase Domain (if not done)

Popular registrars:
- Namecheap
- GoDaddy
- Google Domains
- Cloudflare

**Recommended domain: `shieldsight.tech` or `shieldsight.com`**

#### Step 2: Configure Vercel Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter: `shieldsight.tech`
4. Click "Add"
5. Vercel will provide DNS records

**Typical DNS records:**
```
Type    Name    Value                   TTL
A       @       76.76.21.21            Auto
A       www     76.76.21.21            Auto
```

#### Step 3: Configure DNS

**At your domain registrar:**

1. Go to DNS settings
2. Add records provided by Vercel
3. Wait for DNS propagation (5-60 minutes)

#### Step 4: Configure Railway Custom Domain

1. Railway Dashboard → Your Service → Settings → Domains
2. Click "Custom Domain"
3. Enter: `api.shieldsight.tech`
4. Railway provides CNAME record

**Add to DNS:**
```
Type     Name    Value                          TTL
CNAME    api     your-app.railway.app          Auto
```

#### Step 5: Enable HTTPS

Both Vercel and Railway automatically provision SSL certificates.

**Verify:**
```bash
# Frontend
curl -I https://shieldsight.tech
# Should show: HTTP/2 200

# Backend
curl -I https://api.shieldsight.tech/health
# Should show: HTTP/2 200
```

### Day 3-4: Final Testing

```bash
# Update frontend environment to use custom domain
# .env.production
VITE_API_URL=https://api.shieldsight.tech

# Redeploy frontend
vercel --prod

# Full system test
# Visit https://shieldsight.tech
# Test all features again
```

### Day 5: Production Launch 🚀

**Pre-launch checklist:**
```
✓ Custom domains working
✓ SSL certificates active
✓ All features tested on production
✓ Analytics tracking verified
✓ Error monitoring active
✓ Performance acceptable
✓ Mobile responsive confirmed
✓ SEO elements in place
✓ Backup plan ready
```

**Launch steps:**

1. **Final deployment**
   ```bash
   # Backend
   cd backend
   git add .
   git commit -m "Production ready"
   git push origin main
   railway up

   # Frontend
   cd frontend
   git add .
   git commit -m "Production ready"
   git push origin main
   vercel --prod
   ```

2. **Announce launch**
   - Social media posts
   - Product Hunt submission
   - HackerNews post
   - Reddit communities

3. **Monitor systems**
   ```bash
   # Watch logs
   railway logs

   # Monitor Vercel dashboard
   # Check Analytics
   ```

### Day 6-7: Post-Launch Monitoring

```bash
# Check uptime
curl https://shieldsight.tech
curl https://api.shieldsight.tech/health

# Monitor error rates
# Review Analytics
# Check Search Console
```

---

## WEEK 4: SEO & MARKETING

### Day 1: Search Engine Submission

#### Google Search Console

1. Go to https://search.google.com/search-console
2. Click "Add Property"
3. Enter: `https://shieldsight.tech`
4. Verify ownership:
   - **HTML tag method:** Copy meta tag to index.html
   - **DNS method:** Add TXT record to DNS
5. Submit sitemap:
   - Sitemaps → Add new sitemap
   - Enter: `https://shieldsight.tech/sitemap.xml`
   - Click "Submit"

#### Bing Webmaster Tools

1. Go to https://www.bing.com/webmasters
2. Add site: `https://shieldsight.tech`
3. Verify ownership
4. Submit sitemap

### Day 2-3: Content Marketing

```bash
# Create blog directory
mkdir -p frontend/src/pages/blog

# Write first blog post:
# "Top 10 Phishing Attacks in 2026"
# Optimize for keywords
# Include internal links
# Add schema markup
```

### Day 4-5: Link Building

**Action items:**

1. **Product Hunt Launch**
   - Create product page
   - Schedule launch
   - Engage with community

2. **Social Media**
   - Create Twitter account
   - Create LinkedIn page
   - Share launch announcement

3. **Community Engagement**
   - Post on r/cybersecurity
   - Post on HackerNews
   - Dev.to article
   - Medium article

4. **Backlinks**
   - Submit to directories
   - Reach out to bloggers
   - Guest posting

### Day 6-7: Analytics Review

**Monitor:**

```bash
# Google Analytics
- Page views
- User sessions
- Bounce rate
- Conversion rate

# Search Console
- Impressions
- Clicks
- Average position
- CTR

# Performance
- Page load time
- Core Web Vitals
- Error rate
```

---

## 🔧 Troubleshooting

### Common Issues

**Issue: Build fails on Vercel**
```bash
# Solution: Check build logs
# Ensure all dependencies are in package.json
npm install --save-dev vite
npm install --save-dev @types/node
```

**Issue: API not connecting**
```bash
# Solution: Check CORS settings
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://shieldsight.tech"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Issue: Slow page load**
```bash
# Solution: Enable caching
# vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 📊 Success Metrics

### Track these KPIs:

**Week 1:**
- Deployment successful
- All features working
- Page load < 3s

**Month 1:**
- 100+ organic visitors
- Google indexed all pages
- Lighthouse score > 90

**Month 3:**
- 1,000+ monthly visitors
- 10+ keywords ranking
- 20+ backlinks

**Month 6:**
- 5,000+ monthly visitors
- Top 10 for "phishing detection"
- 50+ backlinks

---

## 🎯 Quick Reference Commands

```bash
# Backend
railway login
railway up
railway logs
railway domain

# Frontend
vercel login
vercel --prod
vercel logs
vercel domains

# Testing
lighthouse https://shieldsight.tech
curl https://api.shieldsight.tech/health

# Monitoring
railway logs --tail
vercel logs --follow
```

---

## ✅ Final Checklist

Before considering deployment complete:

```
✓ Domain configured with SSL
✓ All features tested on production
✓ Analytics tracking data
✓ Search Console verified
✓ Sitemap submitted
✓ Logo and branding updated
✓ Performance optimized
✓ Mobile responsive
✓ Error monitoring active
✓ Backup strategy in place
✓ Documentation complete
✓ Launch announcement ready
```

**Congratulations! 🎉 ShieldSight is now live!**

---
