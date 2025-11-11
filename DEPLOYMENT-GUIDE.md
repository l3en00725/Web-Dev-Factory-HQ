# Deployment Guide

Complete guide for deploying Web-Dev-Factory-HQ sites to production via GitHub and Vercel.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Build Verification](#local-build-verification)
3. [Git Repository Setup](#git-repository-setup)
4. [GitHub Repository Creation](#github-repository-creation)
5. [Vercel Project Setup](#vercel-project-setup)
6. [Environment Variables](#environment-variables)
7. [Custom Domain Setup](#custom-domain-setup)
8. [Auto-Deploy Workflow](#auto-deploy-workflow)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Site built successfully with `bun run build`
- ✅ GitHub account ([github.com](https://github.com))
- ✅ Vercel account ([vercel.com](https://vercel.com)) - free tier is sufficient
- ✅ Git installed locally
- ✅ All environment variables documented

---

## Local Build Verification

Before pushing to production, verify your site builds locally:

```bash
# Navigate to site directory
cd sites/[your-site-name]

# Install dependencies (if not already done)
bun install

# Run build
bun run build

# Verify dist/ folder was created
ls dist/

# Test locally (optional)
bun run preview
# Visit http://localhost:4321
```

**Success Criteria:**
- ✅ Build completes without errors
- ✅ `dist/` folder contains HTML files
- ✅ Site looks correct in preview

---

## Git Repository Setup

### Option A: Using Interactive Script (Recommended)

```bash
# From project root
bun run setup-deployment --site [your-site-name]
```

This will guide you through the entire process.

### Option B: Manual Setup

If git is not initialized in your site directory:

```bash
cd sites/[your-site-name]
git init
git add .
git commit -m "Initial commit - [site-name]"
git branch -M main
```

---

## GitHub Repository Creation

### Step 1: Create New Repository

1. Visit: **[https://github.com/new](https://github.com/new)**
2. Repository name: `[your-site-name]` (e.g., `johns-lawn-care`)
3. Description: Optional (e.g., "Website for John's Lawn Care")
4. Visibility:
   - **Private** (recommended for client sites)
   - Public (if open source)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **"Create repository"**

### Step 2: Connect Local Repository

GitHub will show you commands - use these:

```bash
# Add GitHub as remote
git remote add origin https://github.com/[username]/[repo-name].git

# Push to GitHub
git push -u origin main
```

**Troubleshooting Authentication:**

If prompted for credentials:
- Use a **Personal Access Token** (not password)
- Generate token: GitHub Settings → Developer Settings → Personal Access Tokens → Generate new token
- Permissions needed: `repo` (full control)

---

## Vercel Project Setup

### Step 1: Import Project

1. Visit: **[https://vercel.com/new](https://vercel.com/new)**
2. Click **"Import Git Repository"**
3. Select your GitHub repository
4. Click **"Import"**

### Step 2: Configure Project

**Framework Preset:**
- Select: **Astro**

**Root Directory:**
- Leave as: `./` (default)
- Or specify: `sites/[site-name]` if deploying from monorepo root

**Build & Output Settings:**

```
Build Command:    bun run build
                  (or: npm run build)

Output Directory: dist

Install Command:  bun install
                  (or: npm install)
```

**Node.js Version:**
- 18.x or 20.x (default is fine)

### Step 3: Environment Variables

If your site uses environment variables (`.env` file), add them in Vercel:

**Common Variables:**

```bash
# Contact Forms (if using)
RESEND_API_KEY=re_xxxxxxxxxxxxx
CONTACT_EMAIL=owner@clientwebsite.com
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/xxxxx

# Google API (optional, for automated submissions)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Bing API (optional)
BING_WEBMASTER_API_KEY=xxxxxxxxxxxxx
```

**How to Add:**
1. In Vercel project settings → Environment Variables
2. Add each variable with name and value
3. Select environments: Production, Preview, Development
4. Click "Save"

### Step 4: Deploy

Click **"Deploy"**

Vercel will:
1. Install dependencies
2. Run build command
3. Deploy to CDN
4. Provide deployment URL

**First deployment takes ~2-3 minutes**

---

## Custom Domain Setup

### Option A: Nameservers (Recommended)

**Advantages:**
- Easiest setup
- Automatic SSL
- Vercel manages DNS

**Steps:**

1. In Vercel project → Settings → Domains
2. Click "Add Domain"
3. Enter: `clientwebsite.com`
4. Vercel will show nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
5. Go to your domain registrar (GoDaddy, Namecheap, etc.)
6. Update nameservers to Vercel's
7. Wait 24-48 hours for DNS propagation

### Option B: CNAME Records

**Use if:**
- Client wants to keep existing nameservers
- Only adding subdomain (www)

**Steps:**

1. In domain registrar's DNS settings, add:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

2. For apex domain (`clientwebsite.com`):

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

3. In Vercel, add both:
   - `clientwebsite.com`
   - `www.clientwebsite.com`

### Verify Domain

After DNS changes:
1. Check propagation: [whatsmydns.net](https://whatsmydns.net)
2. Vercel will auto-issue SSL certificate
3. HTTPS will be enabled automatically

---

## Auto-Deploy Workflow

### How It Works

Once connected to GitHub, Vercel automatically deploys:

**Production Deployments:**
- Triggered by: Push to `main` branch
- URL: Your custom domain (or `[project].vercel.app`)
- Every push = new deployment

**Preview Deployments:**
- Triggered by: Push to any other branch
- URL: Unique URL for each branch/commit
- Perfect for testing before production

### Making Changes

```bash
# Make changes to site
cd sites/[your-site-name]

# Edit files...

# Commit changes
git add .
git commit -m "Update homepage hero section"

# Push to GitHub
git push

# Vercel automatically deploys! 🚀
```

**Deployment typically completes in 1-2 minutes**

### Monitoring Deployments

**In Vercel Dashboard:**
- View deployment status in real-time
- See build logs
- Preview deployments before production
- Rollback to previous deployments if needed

---

## Troubleshooting

### Build Fails in Vercel

**Error: "Command not found: bun"**

Solution: Change build command to:
```
npm run build
```

**Error: "Build exceeded maximum duration"**

Solution:
- Check for large dependencies
- Optimize images before build
- Consider upgrading Vercel plan

**Error: "Module not found"**

Solution:
- Ensure all dependencies in `package.json`
- Delete `node_modules` and `bun.lockb` locally
- Run `bun install` to regenerate lock file
- Commit and push

### Site Loads But Missing Styles

Check:
- `dist/` folder contains CSS files
- Astro config has correct `base` path
- No hardcoded URLs to localhost

### Environment Variables Not Working

- Verify variables are set in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)
- For Astro, use `import.meta.env.VARIABLE_NAME`

### Custom Domain Not Working

**DNS not propagating:**
- Can take 24-48 hours
- Check with: `dig clientwebsite.com`
- Verify nameservers with registrar

**SSL Certificate Issues:**
- Vercel auto-issues Let's Encrypt certificates
- Can take up to 24 hours
- Ensure CAA records allow Let's Encrypt

### GitHub Push Authentication Fails

**Use Personal Access Token:**
1. GitHub → Settings → Developer Settings
2. Personal Access Tokens → Generate new token
3. Select `repo` scope
4. Use token as password when pushing

**Or use SSH:**
```bash
git remote set-url origin git@github.com:[username]/[repo].git
```

---

## Quick Reference

### Deployment Checklist

- [ ] Local build succeeds
- [ ] Git repository initialized
- [ ] Committed all changes
- [ ] Created GitHub repository
- [ ] Pushed to GitHub
- [ ] Connected to Vercel
- [ ] Configured environment variables
- [ ] First deployment successful
- [ ] Custom domain added (if applicable)
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Site accessible at production URL

### Common Commands

```bash
# Check git status
git status

# View commit history
git log --oneline

# View remote URL
git remote -v

# Force rebuild in Vercel (without code changes)
git commit --allow-empty -m "Trigger rebuild"
git push

# Rollback to previous commit
git revert HEAD
git push
```

### Useful Links

- **Vercel Dashboard:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **GitHub Repositories:** [github.com/[username]?tab=repositories](https://github.com)
- **DNS Checker:** [whatsmydns.net](https://whatsmydns.net)
- **SSL Checker:** [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/)

---

## Next Steps

After successful deployment:

1. **Run Post-Launch Checklist:**
   ```bash
   bun run post-launch --site [your-site-name]
   ```

2. **Submit to Search Engines:**
   - Google Search Console
   - Bing Webmaster Tools

3. **Monitor Performance:**
   - PageSpeed Insights
   - Vercel Analytics
   - Search Console metrics

4. **Update Client:**
   - Provide live URL
   - Share Vercel dashboard access
   - Document deployment process

---

**Need Help?**

If you encounter issues not covered here, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Astro Deployment Guide](https://docs.astro.build/en/guides/deploy/)
- [GitHub Docs](https://docs.github.com)

