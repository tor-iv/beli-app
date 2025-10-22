# Next Steps: Beli Web App Development

**Last Updated:** 2025-10-22
**Current Status:** Monorepo setup complete, ready for web app development

---

## Table of Contents

1. [Current State](#current-state)
2. [Immediate Next Steps](#immediate-next-steps)
3. [What's Manual vs Claude Code](#whats-manual-vs-claude-code)
4. [Development Workflow](#development-workflow)
5. [Deployment Guide](#deployment-guide)
6. [Phase-by-Phase Breakdown](#phase-by-phase-breakdown)

---

## Current State

### ✅ Completed
- [x] Created `beli-web/` directory with Next.js 15
- [x] Installed Next.js, TypeScript, Tailwind CSS
- [x] Updated root `.gitignore` with Next.js entries
- [x] Updated `README.md` for monorepo structure
- [x] Updated `CLAUDE.md` with web development commands
- [x] Created `vercel.json` deployment config
- [x] Committed all changes to Git
- [x] Verified Next.js build works

### 📍 Current Location
You are at the **starting point** of web app development. The foundation is set, now ready to build the actual application.

### 🎯 Next Milestone
Deploy a working web app to Vercel with at least one screen (Feed screen) functional.

---

## Immediate Next Steps

### Step 1: Deploy to Vercel (Manual - 10 minutes)

**Why do this first?**
- Establishes CI/CD pipeline early
- Tests deployment configuration
- Gives you a live URL to share progress
- Ensures monorepo structure works with Vercel

**Instructions:**

1. **Push current commit to GitHub** (if not already done):
   ```bash
   git push origin main
   ```

2. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/new
   - Sign in with GitHub
   - Click "Import Project"
   - Select `tor-iv/beli-app` repository

3. **Configure Project Settings:**
   ```
   Framework Preset: Next.js
   Root Directory: beli-web     ← CRITICAL - This tells Vercel where the web app is
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Click "Deploy"**
   - First deployment takes ~2-3 minutes
   - You'll get a production URL (e.g., `https://beli-web-xxx.vercel.app`)

5. **Verify Deployment:**
   - Visit the URL
   - Should see the default Next.js welcome page
   - Check deployment logs if there are issues

6. **Connect to GitHub (automatic):**
   - Every push to `main` → production deployment
   - Every PR → preview deployment
   - Only triggers when `beli-web/` files change

**✅ Success Criteria:**
- Live URL working
- Deployment shows green status
- Auto-deployment enabled

---

### Step 2: Initialize shadcn/ui (Claude Code - 5 minutes)

**What:** Install shadcn/ui component library that gives you pre-built, customizable React components.

**Why:** shadcn/ui components will save hours of UI development and match modern design standards.

**Claude Code can do:**
```bash
cd beli-web
npx shadcn@latest init
```

**During setup, Claude will select:**
- Style: New York
- Base color: Slate
- CSS variables: Yes

**Then install core components:**
```bash
npx shadcn@latest add button card avatar badge input dialog tabs dropdown-menu select skeleton separator
```

**Result:** Components created in `beli-web/components/ui/`

---

### Step 3: Configure Design System (Claude Code - 30 minutes)

**What:** Customize Tailwind CSS with Beli's exact colors, typography, and spacing from the mobile app.

**Claude Code will:**
1. Edit `tailwind.config.ts` with Beli design tokens:
   - Primary teal (#0A6C70)
   - Rating colors (excellent/good/average/poor)
   - Typography scale (11px - 34px)
   - Spacing values matching mobile

2. Edit `app/globals.css` with custom utilities:
   - Rating bubble classes
   - Card styles
   - Custom animations

3. Create `lib/constants.ts`:
   - Rating color utilities
   - Helper functions
   - Breakpoints

**Result:** Design system matching mobile app pixel-perfect

---

### Step 4: Copy Types & Mock Data (Claude Code - 15 minutes)

**What:** Copy TypeScript types and mock data from `beli-native/` to `beli-web/`.

**Claude Code will:**
1. Copy `beli-native/src/types.ts` → `beli-web/types/index.ts`
2. Copy `beli-native/src/data/mock/` → `beli-web/data/mock/`
3. Copy `beli-native/src/data/mockDataService.ts` → `beli-web/lib/mockDataService.ts`
4. Update all import paths to use `@/` alias

**Files copied:**
- `types/index.ts` (User, Restaurant, FeedItem, etc.)
- `data/mock/users.ts`
- `data/mock/restaurants.ts`
- `data/mock/reviews.ts`
- `data/mock/activities.ts`
- `data/mock/lists.ts`
- `data/mock/userRestaurantRelations.ts`
- `lib/mockDataService.ts`

**Result:** Same data structure as mobile, ready to use

---

### Step 5: Build First Screen (Claude Code - 45 minutes)

**What:** Implement the Feed screen to prove the concept works.

**Claude Code will:**
1. Create `app/feed/page.tsx` (Feed screen)
2. Create `components/layout/header.tsx` (Navigation)
3. Create `components/social/activity-card.tsx` (Feed item card)
4. Create `components/rating/rating-bubble.tsx` (Rating display)
5. Update `app/layout.tsx` (Root layout with header)
6. Create React Query hooks in `lib/hooks/`

**Result:** Working feed screen at `/feed` with real-looking data

---

### Step 6: Test & Deploy First Screen (Mixed - 15 minutes)

**Manual:**
1. Test locally: `cd beli-web && npm run dev`
2. Visit http://localhost:3000/feed
3. Verify feed displays correctly
4. Check responsive design (mobile/tablet/desktop)

**Claude Code:**
1. Fix any bugs found during testing
2. Commit changes with proper message
3. Push to GitHub

**Automatic (Vercel):**
- Deployment triggers automatically
- Preview deployment created
- Check live URL

**✅ Checkpoint:** First functional screen deployed!

---

## What's Manual vs Claude Code

### 🙋 Manual Tasks (You Do These)

#### 1. Vercel Deployment Setup
**Why Manual:** Requires GitHub authentication, payment setup (if needed), domain configuration
**Time:** 10-15 minutes
**Frequency:** Once

**Steps:**
- Connect GitHub account to Vercel
- Import repository
- Configure root directory to `beli-web`
- Set up custom domain (optional)
- Configure environment variables (future)

#### 2. Design Decisions
**Why Manual:** Requires human judgment and preferences
**Time:** Varies
**Examples:**
- Choose navigation style (top bar vs sidebar)
- Decide on homepage content
- Pick which features to prioritize
- Approve design implementations

#### 3. Testing User Experience
**Why Manual:** Requires human interaction and judgment
**Time:** 15-30 minutes per feature
**What to test:**
- Click through all screens
- Test on different devices (phone, tablet, desktop)
- Verify colors match mobile app
- Check responsive behavior
- Test forms and interactions

#### 4. Content Decisions
**Why Manual:** Requires brand/marketing input
**Examples:**
- Homepage copy
- Meta descriptions for SEO
- Error messages
- Empty state messages
- Button labels

#### 5. Code Review & Approval
**Why Manual:** You should review what Claude builds
**Best Practice:**
- Review major component implementations
- Approve design system configurations
- Check that code follows your preferences

#### 6. Git Operations (Optional)
**Why Manual:** You may want control over git workflow
**Claude can do these too, but you might prefer:**
- Final commit review before push
- Pull request creation
- Merge decisions
- Branch management

---

### 🤖 Claude Code Tasks (Automated)

#### 1. Initial Setup & Configuration
**What Claude Does:**
- Run `npx shadcn@latest init`
- Install npm packages
- Configure `tailwind.config.ts`
- Set up `tsconfig.json`
- Create folder structure

**Why Claude:** Repetitive, well-defined steps

#### 2. File Copying & Code Migration
**What Claude Does:**
- Copy types from `beli-native/src/types.ts`
- Copy mock data files
- Copy MockDataService
- Update import paths
- Fix TypeScript errors

**Why Claude:** Mechanical copying with path updates

#### 3. Component Development
**What Claude Does:**
- Create React components (RestaurantCard, ActivityCard, etc.)
- Implement layouts (Header, Navigation, Footer)
- Build forms (Search, Login, etc.)
- Create loading states and skeletons
- Style with Tailwind CSS

**Why Claude:**
- Follows patterns from mobile app
- Uses shadcn/ui components
- Applies design system consistently

#### 4. Screen Implementation
**What Claude Does:**
- Create Next.js pages in `app/` directory
- Implement routing
- Set up data fetching with React Query
- Handle loading and error states
- Make responsive layouts

**Why Claude:**
- Clear requirements from implementation plan
- Known patterns from mobile app
- Repetitive structure across screens

#### 5. Custom Hooks & Utilities
**What Claude Does:**
- Create `use-restaurants.ts`, `use-feed.ts`, etc.
- Build helper functions
- Set up React Query configuration
- Create utility classes

**Why Claude:** Follows standard patterns

#### 6. Styling & Design System
**What Claude Does:**
- Configure Tailwind with Beli colors
- Create custom CSS utilities
- Implement design tokens
- Ensure responsive design
- Match mobile app styling

**Why Claude:**
- Design system is documented
- Colors/spacing are defined
- Systematic implementation

#### 7. Type Definitions
**What Claude Does:**
- Create/update TypeScript interfaces
- Fix type errors
- Add proper typing to components
- Ensure strict mode compliance

**Why Claude:** Well-suited for TypeScript work

#### 8. Bug Fixes & Debugging
**What Claude Does:**
- Fix TypeScript errors
- Resolve import issues
- Debug console errors
- Fix responsive layout issues
- Handle edge cases

**Why Claude:**
- Can read error messages
- Systematic debugging approach
- Quick iteration

#### 9. Git Commits
**What Claude Does:**
- Stage files with `git add`
- Write descriptive commit messages
- Follow commit conventions
- Create organized commits
- Push to GitHub

**Why Claude:**
- Follows your commit message style
- Proper formatting
- Includes co-authorship

#### 10. Documentation
**What Claude Does:**
- Create README files
- Write code comments
- Generate API documentation
- Update CLAUDE.md
- Create implementation notes

**Why Claude:** Documentation generation is straightforward

---

### 🤝 Collaborative Tasks (Both)

#### 1. Feature Planning
- **You:** Define what features you want
- **Claude:** Break down into implementation steps
- **You:** Approve the plan
- **Claude:** Execute the plan

#### 2. Design Implementation
- **You:** Provide design references (mobile app, screenshots)
- **Claude:** Implement the design
- **You:** Review and request adjustments
- **Claude:** Make refinements

#### 3. Bug Fixing
- **You:** Identify bugs during testing
- **Claude:** Investigate and fix
- **You:** Verify fix works
- **Claude:** Commit the fix

#### 4. Performance Optimization
- **You:** Identify slow areas
- **Claude:** Implement optimizations
- **You:** Test performance improvements
- **Claude:** Fine-tune as needed

---

## Development Workflow

### Recommended Cycle

```
1. You: Choose next feature to implement
   ↓
2. Claude: Break down into tasks
   ↓
3. You: Approve approach
   ↓
4. Claude: Implement feature
   ↓
5. You: Test locally (npm run dev)
   ↓
6. You: Report bugs/changes
   ↓
7. Claude: Fix and refine
   ↓
8. Claude: Commit to git
   ↓
9. You: Push to GitHub (or Claude does it)
   ↓
10. Automatic: Vercel deploys
   ↓
11. You: Test on live URL
   ↓
12. Repeat for next feature
```

### Example Session

**You:** "Let's implement the search screen"

**Claude:**
- Creates `app/search/page.tsx`
- Builds `SearchInput` component
- Implements restaurant filtering
- Adds `use-search-restaurants.ts` hook
- Styles with Tailwind
- Tests TypeScript compilation

**You:**
- Run `npm run dev`
- Test search functionality
- Notice filter button doesn't work on mobile

**Claude:**
- Fixes mobile touch target size
- Improves responsive layout
- Commits changes

**You:**
- Verify fix works
- Push to GitHub (or ask Claude to)

**Vercel:**
- Auto-deploys in ~2 minutes
- Sends you deployment URL

**You:**
- Test on live site
- Share progress with others

---

## Deployment Guide

### Vercel Setup (One-Time, Manual)

#### Step 1: Create Vercel Account
1. Go to https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel to access GitHub

#### Step 2: Import Project
1. Click "Add New Project"
2. Find `tor-iv/beli-app` in repository list
3. Click "Import"

#### Step 3: Configure Build Settings
```
Project Name: beli-web
Framework: Next.js
Root Directory: beli-web         ← CRITICAL
Build Command: npm run build     ← Default, leave as-is
Output Directory: .next          ← Default, leave as-is
Install Command: npm install     ← Default, leave as-is
```

#### Step 4: Deploy
1. Click "Deploy"
2. Wait ~2-3 minutes
3. Get production URL: `https://beli-web-[random].vercel.app`

#### Step 5: Configure Domain (Optional)
1. Go to Project Settings → Domains
2. Add custom domain (e.g., `app.beli.com`)
3. Update DNS records as instructed
4. Wait for DNS propagation (~5-60 minutes)

### Automatic Deployments

After initial setup, deployments happen automatically:

#### Production Deployments
```bash
git push origin main
```
- Triggers when: Push to `main` branch with `beli-web/` changes
- Deploys to: Production URL
- Time: ~2 minutes
- Notifies: Email + Vercel dashboard

#### Preview Deployments
```bash
git checkout -b feature/new-screen
# make changes
git push origin feature/new-screen
# create pull request
```
- Triggers when: Push to any branch with PR
- Deploys to: Unique preview URL
- Time: ~2 minutes
- Comments: Vercel bot comments on PR with URL

#### What Triggers Deployment?
- ✅ Changes to `beli-web/**/*` files
- ❌ Changes only to `beli-native/` (ignored)
- ❌ Changes only to documentation (ignored)
- ✅ Changes to root files AND `beli-web/` (deploys)

---

## Phase-by-Phase Breakdown

### Phase 1: Foundation (Day 1 - 2 hours)

**Goal:** Working development environment with design system

| Task | Who | Time | Status |
|------|-----|------|--------|
| Deploy to Vercel | Manual | 10 min | ⏳ Next |
| Initialize shadcn/ui | Claude | 5 min | ⏳ |
| Configure Tailwind with Beli colors | Claude | 20 min | ⏳ |
| Create theme constants | Claude | 10 min | ⏳ |
| Copy TypeScript types | Claude | 5 min | ⏳ |
| Copy mock data | Claude | 10 min | ⏳ |
| Copy MockDataService | Claude | 10 min | ⏳ |
| Create React Query hooks | Claude | 15 min | ⏳ |
| Test build | Manual | 2 min | ⏳ |

**Deliverable:** Design system configured, data layer ready

---

### Phase 2: First Screen (Day 1 - 2 hours)

**Goal:** Feed screen working end-to-end

| Task | Who | Time | Status |
|------|-----|------|--------|
| Create root layout | Claude | 10 min | ⏳ |
| Build header navigation | Claude | 20 min | ⏳ |
| Create rating bubble component | Claude | 10 min | ⏳ |
| Build activity card component | Claude | 20 min | ⏳ |
| Implement feed page | Claude | 20 min | ⏳ |
| Test locally | Manual | 10 min | ⏳ |
| Fix bugs | Claude | 15 min | ⏳ |
| Commit and push | Claude | 5 min | ⏳ |
| Test deployment | Manual | 5 min | ⏳ |

**Deliverable:** Working feed at `/feed` on production

---

### Phase 3: Core Screens (Day 2 - 4 hours)

**Goal:** All main screens functional

| Task | Who | Time | Status |
|------|-----|------|--------|
| Implement search screen | Claude | 30 min | ⏳ |
| Implement lists screen | Claude | 30 min | ⏳ |
| Implement restaurant detail | Claude | 30 min | ⏳ |
| Implement leaderboard | Claude | 20 min | ⏳ |
| Implement profile screen | Claude | 30 min | ⏳ |
| Create restaurant card component | Claude | 20 min | ⏳ |
| Test all screens | Manual | 30 min | ⏳ |
| Fix responsive issues | Claude | 30 min | ⏳ |
| Commit and deploy | Claude | 10 min | ⏳ |

**Deliverable:** All 5 main screens + restaurant detail working

---

### Phase 4: Polish (Day 3 - 3 hours)

**Goal:** Production-ready app

| Task | Who | Time | Status |
|------|-----|------|--------|
| Add loading skeletons | Claude | 30 min | ⏳ |
| Add error states | Claude | 20 min | ⏳ |
| Improve animations | Claude | 20 min | ⏳ |
| Add SEO metadata | Claude | 20 min | ⏳ |
| Optimize images | Claude | 15 min | ⏳ |
| Test Lighthouse scores | Manual | 10 min | ⏳ |
| Cross-browser testing | Manual | 30 min | ⏳ |
| Mobile testing | Manual | 20 min | ⏳ |
| Fix issues | Claude | 30 min | ⏳ |
| Final commit | Claude | 5 min | ⏳ |

**Deliverable:** Polished, production-ready web app

---

## Success Metrics

### Technical Checklist
- [ ] All screens render without errors
- [ ] TypeScript builds with no errors (`npx tsc --noEmit`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility = 100
- [ ] Lighthouse SEO = 100
- [ ] Mobile responsive (320px - 1920px)
- [ ] Works in Chrome, Safari, Firefox

### Feature Checklist
- [ ] Feed screen displays activities
- [ ] Search finds restaurants
- [ ] Lists show user collections
- [ ] Leaderboard displays rankings
- [ ] Profile shows user stats
- [ ] Restaurant detail shows full info
- [ ] Navigation works between screens
- [ ] Loading states show during data fetch
- [ ] Error states handle failures gracefully

### Deployment Checklist
- [ ] Deployed to Vercel production URL
- [ ] Auto-deployment configured
- [ ] Preview deployments working for PRs
- [ ] Custom domain configured (optional)
- [ ] Environment variables set (if needed)
- [ ] Build logs show no warnings

---

## Common Questions

### Q: Can I run both apps at the same time?
**A:** Yes! They use different ports:
- Mobile: Expo dev server (default port 8081)
- Web: Next.js dev server (port 3000)

```bash
# Terminal 1
cd beli-native && npm start

# Terminal 2
cd beli-web && npm run dev
```

### Q: Will changes to beli-native affect beli-web?
**A:** No, they're completely independent. Each has its own:
- Dependencies (`package.json`)
- Node modules (`node_modules/`)
- Build process
- Deployment pipeline

### Q: How do I share code between native and web?
**A:** For MVP, copy files directly. Later, create a `shared/` directory:
```
shared/
  types/
  utils/
  constants/
```
Then reference from both apps.

### Q: What if Vercel deployment fails?
**A:** Check:
1. Root Directory is set to `beli-web` in Vercel settings
2. Build logs in Vercel dashboard
3. Local build works: `cd beli-web && npm run build`
4. All dependencies are in `package.json`

### Q: Can I use a different hosting provider?
**A:** Yes, but Vercel is optimized for Next.js:
- **Netlify:** Works well, similar setup
- **Cloudflare Pages:** Works, but less Next.js optimization
- **AWS Amplify:** Works, more complex setup
- **Self-hosted:** Requires Node.js server

### Q: How much does Vercel cost?
**A:**
- **Hobby (Free):** Perfect for this project
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic HTTPS
  - Preview deployments
- **Pro ($20/month):** Only needed if you exceed free limits

### Q: Should I create a separate GitHub repo for web?
**A:** No! Monorepo is better because:
- Single source of truth
- Easier to share code later
- Simpler git history
- One place to manage issues/PRs

---

## Quick Reference

### Start Development
```bash
cd beli-web
npm run dev
# Visit http://localhost:3000
```

### Build for Production
```bash
cd beli-web
npm run build
npm start
```

### Type Check
```bash
cd beli-web
npx tsc --noEmit
```

### Lint Code
```bash
cd beli-web
npm run lint
```

### Deploy to Production
```bash
git add .
git commit -m "web: description of changes"
git push origin main
# Vercel auto-deploys in ~2 minutes
```

### Add shadcn Component
```bash
cd beli-web
npx shadcn@latest add [component-name]
# Example: npx shadcn@latest add button
```

---

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Vercel Docs](https://vercel.com/docs)

### Internal Docs
- [beli-web-implementation-plan.md](beli-web-implementation-plan.md) - Detailed build guide
- [CLAUDE.md](CLAUDE.md) - Development commands
- [README.md](README.md) - Project overview
- [beli-app-design-system.md](beli-app-design-system.md) - Design tokens

---

## Ready to Start?

**Your first command should be:**

```bash
# Push current commit to GitHub
git push origin main
```

Then manually set up Vercel deployment (10 minutes).

After Vercel is configured, tell Claude Code:
> "Let's start Phase 1: Initialize shadcn/ui and configure the design system"

Claude will take it from there! 🚀
