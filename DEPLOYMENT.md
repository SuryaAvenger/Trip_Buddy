# Deploying TripBuddy to Google Cloud Run

This guide will help you deploy your TripBuddy application to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud SDK (gcloud CLI)** installed
   - Download from: https://cloud.google.com/sdk/docs/install
3. **Docker** installed (for local testing)
4. **Git** installed

## Step 1: Set Up Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create tripbuddy-app --name="TripBuddy"

# Set the project as default
gcloud config set project tripbuddy-app

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## Step 2: Configure Environment Variables

Your API keys should NOT be in the Docker image. Instead, set them as Cloud Run environment variables:

```bash
# Set environment variables for Cloud Run
gcloud run deploy tripbuddy \
  --set-env-vars="VITE_GEMINI_API_KEY=your_gemini_api_key" \
  --set-env-vars="VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key" \
  --set-env-vars="VITE_GOOGLE_CALENDAR_CLIENT_ID=your_calendar_client_id" \
  --set-env-vars="VITE_GOOGLE_SHEETS_CLIENT_ID=your_sheets_client_id" \
  --set-env-vars="VITE_GOOGLE_API_SCOPE=https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets"
```

## Step 3: Deploy Using Cloud Build (Recommended)

### Option A: Deploy from GitHub (Automated)

1. **Connect your GitHub repository:**
```bash
# Navigate to Cloud Build in Google Cloud Console
# Go to: https://console.cloud.google.com/cloud-build/triggers

# Click "Connect Repository"
# Select GitHub and authorize
# Choose your repository: SuryaAvenger/Trip_Buddy
```

2. **Create a trigger:**
```bash
# In Cloud Build Triggers, click "Create Trigger"
# Name: deploy-tripbuddy
# Event: Push to branch
# Branch: ^main$
# Build configuration: Cloud Build configuration file
# Location: /cloudbuild.yaml
```

3. **Push your code:**
```bash
git add Dockerfile nginx.conf .dockerignore cloudbuild.yaml DEPLOYMENT.md
git commit -m "Add Cloud Run deployment configuration"
git push origin main
```

The app will automatically build and deploy on every push to main!

### Option B: Manual Deployment

```bash
# Build and deploy in one command
gcloud builds submit --config cloudbuild.yaml

# Or build locally and deploy
docker build -t gcr.io/tripbuddy-app/tripbuddy:latest .
docker push gcr.io/tripbuddy-app/tripbuddy:latest
gcloud run deploy tripbuddy \
  --image gcr.io/tripbuddy-app/tripbuddy:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Step 4: Update OAuth Redirect URIs

After deployment, you'll get a Cloud Run URL like: `https://tripbuddy-xxxxx-uc.a.run.app`

Update your Google OAuth credentials:

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client IDs
3. Add authorized JavaScript origins:
   - `https://tripbuddy-xxxxx-uc.a.run.app`
4. Add authorized redirect URIs:
   - `https://tripbuddy-xxxxx-uc.a.run.app`

## Step 5: Update Content Security Policy

Update `index.html` to allow your Cloud Run domain:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self' https://tripbuddy-xxxxx-uc.a.run.app; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com ...">
```

## Step 6: Test Your Deployment

```bash
# Get the service URL
gcloud run services describe tripbuddy --region us-central1 --format 'value(status.url)'

# Open in browser
# The URL will be something like: https://tripbuddy-xxxxx-uc.a.run.app
```

## Monitoring and Logs

```bash
# View logs
gcloud run services logs read tripbuddy --region us-central1

# View metrics in Cloud Console
# Go to: https://console.cloud.google.com/run
```

## Updating the Deployment

```bash
# After making changes, rebuild and redeploy
git add .
git commit -m "Update: description of changes"
git push origin main

# Or manually
gcloud builds submit --config cloudbuild.yaml
```

## Cost Optimization

Cloud Run pricing:
- **Free tier**: 2 million requests/month, 360,000 GB-seconds/month
- **Pay-as-you-go**: Only charged when requests are being processed
- **Auto-scaling**: Scales to zero when not in use

Current configuration:
- Memory: 512Mi
- CPU: 1
- Max instances: 10

Adjust in `cloudbuild.yaml` if needed.

## Troubleshooting

### Build fails
```bash
# Check build logs
gcloud builds list --limit 5
gcloud builds log [BUILD_ID]
```

### Service won't start
```bash
# Check service logs
gcloud run services logs read tripbuddy --region us-central1 --limit 50
```

### Environment variables not working
```bash
# Verify environment variables
gcloud run services describe tripbuddy --region us-central1 --format 'value(spec.template.spec.containers[0].env)'
```

### OAuth errors
- Ensure Cloud Run URL is added to OAuth authorized origins
- Check that redirect URIs match exactly (no trailing slashes)

## Security Best Practices

1. ✅ Never commit `.env` file with real API keys
2. ✅ Use Cloud Run environment variables for secrets
3. ✅ Enable Cloud Armor for DDoS protection (optional)
4. ✅ Set up Cloud CDN for better performance (optional)
5. ✅ Use Secret Manager for sensitive data (advanced)

## Custom Domain (Optional)

```bash
# Map a custom domain
gcloud run domain-mappings create \
  --service tripbuddy \
  --domain tripbuddy.yourdomain.com \
  --region us-central1
```

## Rollback

```bash
# List revisions
gcloud run revisions list --service tripbuddy --region us-central1

# Rollback to previous revision
gcloud run services update-traffic tripbuddy \
  --to-revisions [REVISION_NAME]=100 \
  --region us-central1
```

## Support

For issues with deployment:
- Cloud Run docs: https://cloud.google.com/run/docs
- Cloud Build docs: https://cloud.google.com/build/docs
- GitHub Issues: https://github.com/SuryaAvenger/Trip_Buddy/issues

---

**Happy Deploying! 🚀**