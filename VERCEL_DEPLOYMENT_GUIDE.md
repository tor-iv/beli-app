# Beli-Web Vercel Deployment Guide

Complete guide for deploying the Beli web application to Vercel.

## Pre-Deployment Checklist

- [x] Production build passes (`npm run build`)
- [x] TypeScript compilation succeeds (`npx tsc --noEmit`)
- [x] All pages render correctly
- [x] Git repository connected to GitHub (`git@github.com:tor-iv/beli-app.git`)
- [x] Vercel configuration file exists (`vercel.json`)

## Current Build Status

**Status**: Ready for deployment

**Build Command**: `npm run build` - Successfully builds with Next.js 16 (Turbopack)

**Pages**: 9 routes successfully generated
- Static pages: `/`, `/feed`, `/leaderboard`, `/lists`, `/search`, `/tastemakers`
- Dynamic pages: `/profile/[username]`, `/restaurant/[id]`, `/tastemakers/[username]`, `/tastemakers/posts/[id]`

## Deployment Options

### Option A: Vercel Dashboard (Recommended for First Deploy)

This is the easiest method for initial deployment with full visual control.

#### Step 1: Sign In to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" or "Log In"
3. Choose "Continue with GitHub" for seamless integration
4. Authorize Vercel to access your GitHub account

#### Step 2: Import Your Project

1. From the Vercel dashboard, click "Add New..." → "Project"
2. Find and select the `tor-iv/beli-app` repository
3. Click "Import"

#### Step 3: Configure Project Settings

**CRITICAL**: Since this is a monorepo, you MUST configure the root directory:

```
Framework Preset: Next.js (auto-detected)
Root Directory: beli-web          ← IMPORTANT: Must be set!
Build Command: npm run build       (auto-detected)
Output Directory: .next            (auto-detected)
Install Command: npm install       (auto-detected)
Node.js Version: 18.x              (recommended)
```

#### Step 4: Environment Variables (Optional)

If you need any environment variables (API keys, etc.):

1. In the "Environment Variables" section, click "Add"
2. Enter variable name and value
3. Select environments (Production, Preview, Development)
4. Click "Add"

**Note**: Currently, the app uses mock data and doesn't require environment variables.

#### Step 5: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for the build to complete
3. Vercel will provide a production URL: `https://beli-web.vercel.app` (or similar)

#### Step 6: Verify Deployment

Test all pages on the production URL:
- https://your-app.vercel.app/ (Feed/Home)
- https://your-app.vercel.app/lists
- https://your-app.vercel.app/search
- https://your-app.vercel.app/leaderboard
- https://your-app.vercel.app/tastemakers
- https://your-app.vercel.app/profile/username
- https://your-app.vercel.app/restaurant/rest-001

---

### Option B: Vercel CLI (For Developers)

Use this method for quick deployments from the command line.

#### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate via email or GitHub.

#### Step 3: Deploy from Web Directory

```bash
# Navigate to the web app directory
cd beli-web

# Deploy preview (staging)
vercel

# Deploy to production
vercel --prod
```

The CLI will:
1. Detect Next.js framework automatically
2. Upload your project files
3. Build the application on Vercel's servers
4. Provide deployment URLs

#### Step 4: Link Project (First Time Only)

On first deployment, Vercel CLI will ask:

```
? Set up and deploy "~/beli-app/beli-web"? [Y/n] y
? Which scope do you want to deploy to? [Your Account]
? Link to existing project? [y/N] n
? What's your project's name? beli-web
? In which directory is your code located? ./
```

---

## Auto-Deployment Setup

Once deployed via either method, Vercel automatically sets up:

### Automatic Production Deployments

- **Trigger**: Any push to `main` branch
- **Process**: Automatic build → deploy → production URL update
- **Time**: ~2-3 minutes per deployment

### Preview Deployments

- **Trigger**: Any pull request or push to non-main branches
- **Process**: Automatic build → unique preview URL
- **Benefits**: Test changes before merging to main
- **URL Format**: `https://beli-web-git-[branch-name]-[username].vercel.app`

### Branch Protection (Recommended)

Consider enabling GitHub branch protection:

1. Go to GitHub repository settings
2. Navigate to "Branches" → "Branch protection rules"
3. Add rule for `main` branch:
   - Require pull request reviews
   - Require status checks to pass (Vercel build)
   - Require branches to be up to date

---

## Project Configuration Files

### vercel.json

Location: `/beli-web/vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

This configuration is already set up and optimized for Next.js 16.

### next.config.ts

Location: `/beli-web/next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
};

export default nextConfig;
```

This allows loading images from Unsplash (restaurant photos) and Pravatar (user avatars).

---

## Environment Variables

### Local Development

Create `.env.local` in the `beli-web/` directory (already gitignored):

```bash
# Example - currently not needed as app uses mock data
# NEXT_PUBLIC_API_URL=https://api.beli.app
# API_SECRET_KEY=your-secret-key
```

### Vercel Production

Add environment variables in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add variables for Production, Preview, Development
3. Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
4. Other variables are server-side only

**Current Status**: No environment variables required yet (using MockDataService).

---

## Troubleshooting

### Build Fails with "useSearchParams" Error

**Error**: `useSearchParams() should be wrapped in a suspense boundary`

**Solution**: Already fixed in [app/lists/page.tsx](app/lists/page.tsx). The component using `useSearchParams()` is now wrapped in a `<Suspense>` boundary.

### Build Fails with TypeScript Errors

**Check**: Run `npx tsc --noEmit` locally to see TypeScript errors

**Solution**: Fix TypeScript errors before deploying

### Images Not Loading

**Check**: Verify `next.config.ts` has the correct `remotePatterns` for image domains

**Current**: Configured for `images.unsplash.com` and `i.pravatar.cc`

### Wrong Directory Deployed

**Issue**: Vercel builds the wrong directory in monorepo

**Solution**: Set "Root Directory" to `beli-web` in Vercel project settings

### Build Succeeds but Pages Return 404

**Check**: Verify all dynamic routes have proper page.tsx files

**Current Status**: All routes properly configured

---

## Performance Optimization

Vercel automatically provides:

- **Edge Network**: Global CDN for static assets
- **Automatic Caching**: Static pages cached at edge locations
- **Image Optimization**: Next.js Image component optimized by Vercel
- **Compression**: Automatic Brotli/Gzip compression
- **HTTP/2 & HTTP/3**: Modern protocol support

### Recommended Optimizations

1. **Static Generation**: Already enabled for most pages
2. **Dynamic Routes**: Use proper caching strategies
3. **Image Optimization**: Use Next.js `<Image>` component (already implemented)
4. **Font Optimization**: Use Next.js font optimization (configure if needed)

---

## Custom Domain Setup (Optional)

### Add Custom Domain

1. Go to Project Settings → Domains
2. Click "Add"
3. Enter your domain (e.g., `app.beli.com`)
4. Follow DNS configuration instructions
5. Vercel automatically provisions SSL certificate

### DNS Configuration

For root domain:
```
Type: A
Name: @
Value: 76.76.21.21
```

For subdomain:
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

**SSL**: Automatic via Let's Encrypt (free)

---

## Monitoring & Analytics

### Vercel Analytics (Optional)

Enable in Vercel dashboard:
1. Go to Analytics tab
2. Click "Enable Analytics"
3. Add Vercel Analytics package:
   ```bash
   npm install @vercel/analytics
   ```
4. Add to app:
   ```typescript
   // app/layout.tsx
   import { Analytics } from '@vercel/analytics/react';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

### Build Logs

View detailed build logs:
1. Go to Deployments tab
2. Click on any deployment
3. View "Building", "Build Logs", "Functions" tabs

---

## Deployment Workflow

### Standard Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and test locally
npm run dev

# 3. Commit changes
git add .
git commit -m "Add new feature"

# 4. Push to GitHub
git push origin feature/new-feature

# 5. Vercel automatically creates preview deployment
# Test at: https://beli-web-git-feature-new-feature-username.vercel.app

# 6. Create pull request on GitHub
# Review preview deployment

# 7. Merge to main
# Vercel automatically deploys to production
```

### Hotfix Workflow

```bash
# Quick production fix
git checkout main
git pull origin main

# Make fix
# Test locally
npm run build  # Verify build works

# Commit and push
git add .
git commit -m "fix: urgent production issue"
git push origin main

# Vercel auto-deploys to production in ~2 minutes
```

---

## Project URLs

### Current Repository
- **GitHub**: https://github.com/tor-iv/beli-app
- **Branch**: main

### Deployment URLs (After Setup)
- **Production**: https://beli-web.vercel.app (or custom domain)
- **Preview**: https://beli-web-git-[branch]-[user].vercel.app
- **Vercel Dashboard**: https://vercel.com/[username]/beli-web

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Next.js 16 Documentation](https://nextjs.org/docs)

---

## Support & Maintenance

### Regular Maintenance

- Monitor build status in Vercel dashboard
- Check deployment logs for errors
- Review analytics for performance issues
- Update dependencies regularly

### Emergency Rollback

If a deployment breaks production:

1. Go to Vercel dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Previous working version is instantly live

---

## Next Steps After Deployment

1. **Test Production Site**: Verify all pages load correctly
2. **Share URL**: Update README.md with production URL
3. **Set Up Monitoring**: Enable Vercel Analytics
4. **Configure Custom Domain**: If you have one
5. **Add Backend**: When ready to replace MockDataService
6. **Environment Variables**: Add when integrating real APIs
7. **Performance Testing**: Use Lighthouse or WebPageTest
8. **SEO Optimization**: Add meta tags, sitemap, robots.txt

---

**Last Updated**: October 27, 2025
**Build Status**: Passing ✓
**Ready for Deployment**: Yes ✓
