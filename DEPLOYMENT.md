# ShopSmart Deployment Guide

This guide covers deploying ShopSmart to production using Vercel (frontend) and Render (backend) with automated CI/CD via GitHub Actions.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier works)
- Render account (free tier works)
- Git repository with your code

## 🚀 Deployment Steps

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shopsmart.git
git push -u origin main
```

### 2. Deploy Backend to Render

#### Option A: Using Render Dashboard (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `shopsmart-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables:
   ```
   DATABASE_URL=file:./prod.db
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-this
   NODE_ENV=production
   PORT=10000
   ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   ```

6. Click **"Create Web Service"**
7. Wait for deployment to complete
8. Copy your backend URL (e.g., `https://shopsmart-backend.onrender.com`)

#### Option B: Using render.yaml

The `render.yaml` file is already configured. Just:
1. Go to Render Dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will auto-detect `render.yaml` and create services

### 3. Deploy Frontend to Vercel

#### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

#### Step 2: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

6. Click **"Deploy"**
7. Wait for deployment to complete
8. Copy your frontend URL (e.g., `https://shopsmart.vercel.app`)

#### Step 3: Update Backend CORS

Go back to Render and update the `ALLOWED_ORIGINS` environment variable:
```
ALLOWED_ORIGINS=https://shopsmart.vercel.app,https://shopsmart-*.vercel.app
```

### 4. Setup GitHub Actions CI/CD

#### Step 1: Get Vercel Credentials

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
cd client
vercel link

# Get your credentials
vercel env pull .env.local
```

Your Vercel credentials are in `.vercel/project.json`:
- `orgId` → `VERCEL_ORG_ID`
- `projectId` → `VERCEL_PROJECT_ID`

Get your Vercel token from: https://vercel.com/account/tokens

#### Step 2: Get Render Credentials

1. Go to your Render service dashboard
2. Click **"Settings"** → **"Deploy Hook"**
3. Create a new deploy hook
4. Copy the webhook URL → `RENDER_DEPLOY_HOOK`
5. Your service URL → `RENDER_API_URL` (e.g., `https://shopsmart-backend.onrender.com`)

#### Step 3: Add GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

**Vercel Secrets:**
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID
- `VITE_API_URL`: Your production backend URL

**Render Secrets:**
- `RENDER_DEPLOY_HOOK`: Your Render deploy hook URL
- `RENDER_API_URL`: Your Render service URL

#### Step 4: Test CI/CD

```bash
# Make a change and push
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

Go to **Actions** tab in GitHub to see the workflow running.

## 🔧 Post-Deployment Setup

### 1. Seed Production Database

SSH into your Render service or use Render Shell:

```bash
cd server
node seed-data.js
```

Or create a one-time job in Render dashboard.

### 2. Test the Application

1. Visit your frontend URL
2. Register a new user/seller
3. Test all features:
   - User registration/login
   - Product browsing
   - Add to cart
   - Place order
   - Seller dashboard

### 3. Monitor Logs

**Render Logs:**
- Go to your service dashboard
- Click **"Logs"** tab

**Vercel Logs:**
- Go to your project dashboard
- Click on a deployment
- View **"Functions"** or **"Build Logs"**

## 🔒 Security Checklist

- [ ] Change all default secrets (JWT_SECRET, REFRESH_TOKEN_SECRET)
- [ ] Update ALLOWED_ORIGINS with your production URLs
- [ ] Enable HTTPS (automatic on Vercel and Render)
- [ ] Review rate limiting settings
- [ ] Set up monitoring and alerts
- [ ] Configure custom domain (optional)
- [ ] Enable Vercel Analytics (optional)
- [ ] Set up error tracking (Sentry, etc.)

## 🐛 Troubleshooting

### Backend Issues

**Database not found:**
```bash
# Run migrations manually in Render Shell
npx prisma migrate deploy
```

**CORS errors:**
- Check `ALLOWED_ORIGINS` includes your frontend URL
- Ensure no trailing slashes in URLs

**500 errors:**
- Check Render logs for detailed error messages
- Verify all environment variables are set

### Frontend Issues

**API calls failing:**
- Verify `VITE_API_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend is running

**Build failures:**
- Check Vercel build logs
- Verify all dependencies are in `package.json`
- Test build locally: `npm run build`

### CI/CD Issues

**Tests failing:**
- Run tests locally first: `npm test`
- Check GitHub Actions logs for details

**Deployment failing:**
- Verify all GitHub secrets are set correctly
- Check Vercel/Render credentials are valid
- Ensure deploy hooks are working

## 📊 Monitoring

### Render Monitoring
- CPU/Memory usage in dashboard
- Request logs
- Error tracking

### Vercel Monitoring
- Analytics (if enabled)
- Function logs
- Build logs

## 🔄 Updating the Application

### Automatic Deployment (via CI/CD)

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main
```

GitHub Actions will automatically:
1. Run tests
2. Deploy frontend to Vercel
3. Deploy backend to Render

### Manual Deployment

**Frontend:**
```bash
cd client
vercel --prod
```

**Backend:**
```bash
# Trigger deploy hook
curl -X POST $RENDER_DEPLOY_HOOK
```

## 💰 Cost Considerations

### Free Tier Limits

**Render Free Tier:**
- 750 hours/month
- Spins down after 15 minutes of inactivity
- 512 MB RAM
- Shared CPU

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS

### Upgrading

If you need more resources:
- **Render**: Upgrade to Starter ($7/month) or higher
- **Vercel**: Upgrade to Pro ($20/month) for team features

## 🎯 Production Best Practices

1. **Use PostgreSQL instead of SQLite** for production (Render offers free PostgreSQL)
2. **Set up database backups** (automatic with Render PostgreSQL)
3. **Enable monitoring and alerts**
4. **Use environment-specific configs**
5. **Implement proper logging** (Winston, Pino)
6. **Set up error tracking** (Sentry, Rollbar)
7. **Use CDN for static assets** (Vercel does this automatically)
8. **Implement rate limiting** (already configured)
9. **Regular security updates** (`npm audit fix`)
10. **Monitor performance** (Vercel Analytics, New Relic)

## 📝 Environment Variables Reference

### Backend (.env)
```bash
# Database
DATABASE_URL=file:./prod.db  # Use PostgreSQL URL in production

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-min-32-chars

# Server
PORT=10000
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-frontend-*.vercel.app
```

### Frontend (.env)
```bash
VITE_API_URL=https://your-backend.onrender.com
```

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Render/Vercel documentation
3. Check GitHub Actions logs
4. Review application logs

## 🎉 Success!

Your ShopSmart e-commerce platform is now live! 🚀

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.onrender.com
- **CI/CD**: Automated via GitHub Actions

Happy selling! 🛍️
