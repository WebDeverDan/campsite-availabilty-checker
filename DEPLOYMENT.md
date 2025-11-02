# Deploying to Render.com

This guide walks you through deploying the Campsite Availability Checker to Render.com with secure API key handling.

## Why Render?

- ✅ **Free tier** with generous limits
- ✅ **Automatic HTTPS**
- ✅ **Secure environment variables** for API keys
- ✅ **Automatic deployments** from GitHub
- ✅ **No CORS issues** (unlike GitHub Pages)
- ✅ **Easy setup** - just a few clicks

## Prerequisites

1. A GitHub account with your code pushed to a repository
2. A Render.com account (sign up at https://render.com - free!)

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

If you haven't already:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Campsite Availability Checker"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

**Important:** Make sure `.env` is in your `.gitignore` so your API key doesn't get pushed to GitHub!

### 2. Create a Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended for easy connection)

### 3. Create a New Static Site

1. From your Render dashboard, click **"New +"** button
2. Select **"Static Site"**
3. Connect your GitHub repository
   - If first time: Authorize Render to access your GitHub
   - Select your campsite-availability-checker repository
4. Configure the site:

```
Name: campsite-availability-checker (or your choice)
Branch: main
Build Command: npm run build
Publish Directory: dist
```

### 4. Add Environment Variable (API Key)

This is the critical step for keeping your API key secure!

1. Scroll down to **"Environment Variables"** section
2. Click **"Add Environment Variable"**
3. Add your API key:
   ```
   Key: VITE_RECREATION_API_KEY
   Value: your_actual_api_key_here
   ```
4. Click **"Save"**

### 5. Deploy!

1. Click **"Create Static Site"**
2. Render will automatically:
   - Pull your code from GitHub
   - Install dependencies (`npm install`)
   - Build your app (`npm run build`)
   - Deploy to their CDN

The first deployment takes 2-3 minutes. You can watch the logs in real-time.

### 6. Access Your Site

Once deployed, Render gives you a URL like:
```
https://campsite-availability-checker.onrender.com
```

You can also set up a custom domain if you want!

## Automatic Deployments

Every time you push to GitHub, Render will automatically rebuild and deploy your site. No manual steps needed!

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push

# Render automatically detects the push and redeploys!
```

## How It Keeps Your API Key Safe

1. **Environment variables** are stored securely on Render's servers
2. **Not in your code** - never committed to GitHub
3. **Build-time injection** - Vite injects the key during the build process
4. **Not exposed** - The built JavaScript bundles the API calls, but the key itself is baked into the code at build time

**Note:** Since this is a client-side app, the API key will be visible in the browser's network requests. This is why it's important that your Recreation.gov API key:
- Has rate limits (which it does by default)
- Is free to obtain (so if someone copies it, they can just get their own)
- Only accesses public campground data (no sensitive information)

## Troubleshooting

### Build Fails

Check the build logs on Render. Common issues:
- Missing dependencies: Make sure `package.json` is committed
- Build command wrong: Should be `npm run build`
- Node version: Render uses Node 14+ by default

### API Key Not Working

1. Double-check the environment variable name: `VITE_RECREATION_API_KEY`
2. Make sure the key is correct (no extra spaces)
3. Redeploy after adding/changing environment variables

### Site Loads But Features Don't Work

1. Check browser console for errors
2. Make sure API key was set before deployment
3. Try a manual deploy from Render dashboard

## Cost

**Render's free tier includes:**
- 100 GB bandwidth/month
- Unlimited static sites
- Automatic SSL certificates
- Global CDN

This is more than enough for a personal project or even moderate traffic!

## Alternative: Using Render Web Service for Backend Proxy

If you want even better security, you can create a backend proxy:

1. Create a new folder `server/` in your project
2. Add a simple Express server that proxies API requests
3. Deploy as a **Web Service** on Render (still free tier)
4. Update your frontend to call your backend instead of the RIDB API directly

This way, your API key never leaves the server. Let me know if you want help setting this up!

## Resources

- [Render Static Sites Docs](https://render.com/docs/static-sites)
- [Environment Variables on Render](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)
