# CI/CD Pipeline Summary

## 🔄 Automated Workflow

Your ShopSmart platform has a **fully automated CI/CD pipeline** using GitHub Actions.

## 📊 Pipeline Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Push to GitHub (main)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     TEST STAGE                               │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │  Frontend Tests  │        │  Backend Tests   │          │
│  │  - Unit Tests    │        │  - Unit Tests    │          │
│  │  - Build Check   │        │  - DB Tests      │          │
│  └──────────────────┘        └──────────────────┘          │
└────────────────────────┬────────────────────────────────────┘
                         │
                    Tests Pass?
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT STAGE                           │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │ Deploy Frontend  │        │ Deploy Backend   │          │
│  │   to Vercel      │        │   to Render      │          │
│  └──────────────────┘        └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 What Happens on Each Push

### 1. **Test Job** (Runs on every push/PR)
- ✅ Installs dependencies for both frontend and backend
- ✅ Runs frontend tests (Vitest)
- ✅ Runs backend tests (Jest)
- ✅ Sets up test database with Prisma
- ✅ Validates code quality

### 2. **Deploy Frontend Job** (Only on main branch)
- ✅ Builds the React application
- ✅ Optimizes assets with Vite
- ✅ Deploys to Vercel
- ✅ Automatic HTTPS and CDN
- ✅ Preview URLs for each deployment

### 3. **Deploy Backend Job** (Only on main branch)
- ✅ Triggers Render deployment via webhook
- ✅ Waits for deployment to complete
- ✅ Verifies deployment with health check
- ✅ Automatic rollback on failure

## 📁 CI/CD Files

### `.github/workflows/deploy.yml`
Main workflow file that orchestrates the entire pipeline.

**Key Features:**
- Parallel test execution
- Conditional deployment (only on main)
- Automatic health checks
- Fail-fast on test failures

### `render.yaml`
Render Blueprint configuration for infrastructure as code.

**Defines:**
- Backend web service configuration
- Frontend static site configuration
- Environment variable mappings
- Build and start commands

## 🔐 Required GitHub Secrets

Add these in: **Repository Settings → Secrets and variables → Actions**

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VERCEL_TOKEN` | Vercel API token | `abc123...` |
| `VERCEL_ORG_ID` | Vercel organization ID | `team_abc123` |
| `VERCEL_PROJECT_ID` | Vercel project ID | `prj_abc123` |
| `VITE_API_URL` | Production backend URL | `https://api.example.com` |
| `RENDER_DEPLOY_HOOK` | Render webhook URL | `https://api.render.com/deploy/...` |
| `RENDER_API_URL` | Render service URL | `https://backend.onrender.com` |

## 🚦 Workflow Triggers

### Automatic Triggers
- **Push to main**: Full test + deploy
- **Pull Request**: Tests only (no deploy)

### Manual Trigger
You can also manually trigger the workflow from GitHub Actions tab.

## 📊 Deployment Environments

### Development
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Database**: SQLite (local file)

### Production
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.onrender.com
- **Database**: SQLite or PostgreSQL (Render)

## ⚡ Deployment Speed

| Stage | Duration |
|-------|----------|
| Tests | ~2-3 minutes |
| Frontend Deploy | ~1-2 minutes |
| Backend Deploy | ~3-5 minutes |
| **Total** | **~6-10 minutes** |

## 🔍 Monitoring Deployments

### GitHub Actions
1. Go to your repository
2. Click **"Actions"** tab
3. View workflow runs and logs

### Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. View deployments and logs

### Render Dashboard
1. Go to https://dashboard.render.com
2. Select your service
3. View logs and metrics

## 🐛 Debugging Failed Deployments

### Test Failures
```bash
# Run tests locally first
cd client && npm test
cd server && npm test
```

### Build Failures
```bash
# Test build locally
cd client && npm run build
```

### Deployment Failures
1. Check GitHub Actions logs
2. Verify all secrets are set
3. Check Vercel/Render dashboards
4. Review error messages

## 🎨 Customizing the Pipeline

### Add More Tests
Edit `.github/workflows/deploy.yml`:
```yaml
- name: Run E2E Tests
  run: |
    cd client
    npm run test:e2e
```

### Add Linting
```yaml
- name: Lint Code
  run: |
    cd client
    npm run lint
```

### Add Security Scanning
```yaml
- name: Security Audit
  run: |
    npm audit --audit-level=high
```

## 🔄 Rollback Strategy

### Automatic Rollback
- Vercel: Automatic rollback on build failure
- Render: Manual rollback from dashboard

### Manual Rollback
**Vercel:**
1. Go to project dashboard
2. Find previous successful deployment
3. Click "Promote to Production"

**Render:**
1. Go to service dashboard
2. Click "Manual Deploy"
3. Select previous commit

## 📈 Best Practices

✅ **Always test locally before pushing**
```bash
npm test
npm run build
```

✅ **Use feature branches**
```bash
git checkout -b feature/new-feature
# Make changes
git push origin feature/new-feature
# Create PR for review
```

✅ **Review PR checks before merging**
- All tests must pass
- No build errors
- Code review approved

✅ **Monitor deployments**
- Check GitHub Actions after push
- Verify deployment in Vercel/Render
- Test production site

✅ **Keep secrets secure**
- Never commit secrets to code
- Rotate secrets regularly
- Use environment-specific secrets

## 🎯 Next Steps

1. **Push to GitHub** to trigger first deployment
2. **Configure secrets** in GitHub repository
3. **Monitor deployment** in Actions tab
4. **Test production** site after deployment
5. **Set up monitoring** (optional)

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

## ✅ CI/CD Checklist

- [x] GitHub Actions workflow configured
- [x] Test stage implemented
- [x] Frontend deployment configured
- [x] Backend deployment configured
- [x] Health checks implemented
- [x] Render Blueprint created
- [ ] GitHub secrets configured (you need to do this)
- [ ] First deployment tested
- [ ] Production monitoring set up

## 🎉 Your CI/CD is Ready!

Every time you push to main:
1. ✅ Tests run automatically
2. ✅ Code is deployed to production
3. ✅ Health checks verify deployment
4. ✅ You get notified of success/failure

**No manual deployment needed!** 🚀
