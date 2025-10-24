# Vercel Deployment Guide

This guide will help you deploy your A/B Testing MVP to Vercel with PostgreSQL.

## Prerequisites

- GitHub account with repository: `https://github.com/igalbo/ab-test-mvp.git`
- Vercel account (free tier works fine)
- Code changes applied (Prisma schema updated to PostgreSQL)

## Step-by-Step Deployment

### Phase 1: Commit and Push Changes

```bash
# Make sure all changes are committed
git add .
git commit -m "Configure for Vercel deployment with PostgreSQL"
git push origin main
```

### Phase 2: Create Vercel Project

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Sign in with your GitHub account

2. **Import Repository**
   - Click "Add New..." → "Project"
   - Find and select `igalbo/ab-test-mvp` from your repositories
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `next build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

   ⚠️ **Don't deploy yet!** Click "Environment Variables" first.

### Phase 3: Set Up Vercel Postgres

1. **Create Database**
   - In your Vercel project, go to the **Storage** tab
   - Click "Create Database"
   - Choose **Postgres**
   - Select your preferred region (choose closest to your target users)
   - Give it a name (e.g., "ab-test-db")
   - Click "Create"

2. **Connect to Project**
   - After database creation, click **"Connect Project"**
   - Select your `ab-test-mvp` project
   - This automatically adds environment variables:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
     - And others...

### Phase 4: Configure Environment Variables

1. **Go to Project Settings**
   - Navigate to: Settings → Environment Variables

2. **Map Database URLs**
   - Vercel auto-adds the Postgres variables, but Prisma needs specific names
   - Add these mappings (copy values from existing Postgres vars):

   ```
   DATABASE_URL = (copy value from POSTGRES_PRISMA_URL)
   DIRECT_URL = (copy value from POSTGRES_URL_NON_POOLING)
   ```

3. **Apply to All Environments**
   - Make sure to check: Production, Preview, Development

### Phase 5: Update Build Settings (Optional but Recommended)

1. **Go to Project Settings → General**

2. **Override Build Command**
   - Find "Build & Development Settings"
   - Override the build command to:

   ```bash
   prisma generate && prisma migrate deploy && next build
   ```

   This ensures:
   - Prisma client is generated
   - Database migrations are applied
   - Next.js builds the app

### Phase 6: Deploy!

1. **Trigger Deployment**
   - Go back to your project dashboard
   - Click "Deployments" tab
   - Click "Redeploy" (or push to GitHub to trigger auto-deploy)

2. **Monitor Build**
   - Watch the build logs
   - First build may take 2-3 minutes
   - Look for "Build successful" message

3. **Check Deployment**
   - Once complete, Vercel provides a URL like:
     `https://ab-test-mvp.vercel.app`
   - Click to visit your live site!

### Phase 7: Verify Deployment

Test your application:

1. ✅ Visit the deployment URL
2. ✅ Create a new experiment
3. ✅ Add variants with sliders
4. ✅ Test assignment functionality
5. ✅ Check responsive design on mobile

## Troubleshooting

### Build Fails with Prisma Error

**Problem**: "Prisma Client could not be generated"

**Solution**: Ensure `postinstall` script in `package.json` includes:

```json
"postinstall": "prisma generate"
```

### Database Connection Error

**Problem**: "Can't reach database server"

**Solution**:

1. Check environment variables are set correctly
2. Verify `DATABASE_URL` uses `POSTGRES_PRISMA_URL` value
3. Verify `DIRECT_URL` uses `POSTGRES_URL_NON_POOLING` value

### Migration Issues

**Problem**: "No migrations found" or schema mismatch

**Solution**:

1. Ensure migrations exist in `prisma/migrations/`
2. Run locally: `npx prisma migrate dev --name init`
3. Commit and push migrations folder
4. Redeploy on Vercel

## Post-Deployment

### Continuous Deployment

Every push to `main` branch will automatically trigger a new deployment.

### Preview Deployments

- Push to other branches creates preview URLs
- Great for testing before merging to main

### Domain Configuration (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Development Workflow

### Local Development

You can continue using SQLite locally:

1. Create a `.env` file (not `.env.example`):

   ```env
   DATABASE_URL="file:./db.sqlite"
   ```

2. Run migrations:

   ```bash
   npx prisma migrate dev
   ```

3. Develop normally:
   ```bash
   npm run dev
   ```

### Testing with PostgreSQL Locally (Optional)

If you want to test PostgreSQL locally:

1. Install PostgreSQL or use Docker
2. Update `.env` with local PostgreSQL URL
3. Run migrations against PostgreSQL
4. Test thoroughly before deploying

## Monitoring & Logs

### View Application Logs

1. Go to your Vercel project
2. Click "Deployments" → Select deployment
3. Click "Logs" to see runtime logs

### Database Monitoring

1. Go to Storage tab
2. Click your Postgres database
3. View metrics, queries, and connection info

## Cost Considerations

### Free Tier Includes:

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless function executions
- ✅ Preview deployments
- ✅ Vercel Postgres: 256MB storage, 1,000 queries/day

### Upgrade If Needed:

- More database storage
- Higher query limits
- Team collaboration features

## Security Notes

- 🔒 Never commit `.env` with real credentials
- 🔒 Environment variables are encrypted in Vercel
- 🔒 Use Vercel's environment variable UI only
- 🔒 Database credentials auto-rotate on rebuild

## Next Steps

After successful deployment:

1. ✅ Set up custom domain (optional)
2. ✅ Configure analytics (Vercel Analytics)
3. ✅ Set up error monitoring (Sentry, etc.)
4. ✅ Add authentication if needed
5. ✅ Implement the optional bonus features from requirements

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Congratulations on deploying your A/B Testing MVP! 🎉**
