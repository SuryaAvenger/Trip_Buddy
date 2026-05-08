# Google Cloud Run Deployment Guide

This guide will help you deploy TripBuddy to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed ([Install Guide](https://cloud.google.com/sdk/docs/install))
3. **Docker** installed (for local testing)
4. **API Keys** ready:
   - Google Gemini API Key
   - Google Maps API Key
   - Google OAuth Client IDs (for Calendar/Sheets)

## Quick Deployment Steps

### 1. Set Up Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create tripbuddy-prod --name="TripBuddy Production"

# Set the project
gcloud config set project tripbuddy-prod

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Configure Environment Variables

Create a `.env.production` file with your API keys:

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_GOOGLE_CALENDAR_CLIENT_ID=your_calendar_client_id_here
VITE_GOOGLE_SHEETS_CLIENT_ID=your_sheets_client_id_here
VITE_GOOGLE_API_SCOPE=https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets
```

**Important:** Add `.env.production` to `.gitignore` to keep secrets safe!

### 3. Build and Deploy

#### Option A: Using Cloud Build (Recommended)

```bash
# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml

# The cloudbuild.yaml will automatically:
# 1. Build the Docker image
# 2. Push to Container Registry
# 3. Deploy to Cloud Run
```

#### Option B: Manual Deployment

```bash
# Build the Docker image
docker build -t gcr.io/tripbuddy-prod/tripbuddy:latest .

# Push to Google Container Registry
docker push gcr.io/tripbuddy-prod/tripbuddy:latest

# Deploy to Cloud Run
gcloud run deploy tripbuddy \
  --image gcr.io/tripbuddy-prod/tripbuddy:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

### 4. Set Environment Variables in Cloud Run

Since the app is client-side, environment variables need to be baked into the build. You have two options:

#### Option A: Build-time Variables (Recommended)

Update your Dockerfile to accept build arguments:

```dockerfile
# In Dockerfile, before RUN npm run build
ARG VITE_GEMINI_API_KEY
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_GOOGLE_CALENDAR_CLIENT_ID
ARG VITE_GOOGLE_SHEETS_CLIENT_ID

ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_GOOGLE_CALENDAR_CLIENT_ID=$VITE_GOOGLE_CALENDAR_CLIENT_ID
ENV VITE_GOOGLE_SHEETS_CLIENT_ID=$VITE_GOOGLE_SHEETS_CLIENT_ID
```

Then build with:

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=_GEMINI_KEY="your_key",_MAPS_KEY="your_key"
```

#### Option B: Runtime Configuration

Create a config endpoint that serves environment variables (requires backend).

### 5. Configure Custom Domain (Optional)

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service tripbuddy \
  --domain tripbuddy.yourdomain.com \
  --region us-central1
```

### 6. Set Up CI/CD with GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Cloud SDK
      uses: google-github-actions/setup-gcloud@v1
      with:
        project_id: ${{ secrets.GCP_PROJECT_ID }}
        service_account_key: ${{ secrets.GCP_SA_KEY }}
    
    - name: Build and Deploy
      run: |
        gcloud builds submit --config cloudbuild.yaml
```

## Testing Locally

```bash
# Build the Docker image
docker build -t tripbuddy:local .

# Run locally
docker run -p 8080:8080 tripbuddy:local

# Open browser
open http://localhost:8080
```

## Monitoring and Logs

```bash
# View logs
gcloud run services logs read tripbuddy --region us-central1

# View service details
gcloud run services describe tripbuddy --region us-central1

# Monitor metrics in Cloud Console
open https://console.cloud.google.com/run
```

## Cost Optimization

Cloud Run pricing is based on:
- **CPU**: Only charged when handling requests
- **Memory**: 512Mi is sufficient for this app
- **Requests**: First 2 million requests/month are free

Estimated cost: **$0-5/month** for low traffic

### Optimization Tips:

1. **Set max instances**: Prevents runaway costs
   ```bash
   --max-instances 10
   ```

2. **Set min instances to 0**: No cost when idle
   ```bash
   --min-instances 0
   ```

3. **Use appropriate memory**: 512Mi is enough
   ```bash
   --memory 512Mi
   ```

4. **Enable request timeout**:
   ```bash
   --timeout 60s
   ```

## Security Best Practices

1. **Never commit API keys** to Git
2. **Use Secret Manager** for sensitive data:
   ```bash
   gcloud secrets create gemini-api-key --data-file=-
   ```

3. **Enable HTTPS** (automatic with Cloud Run)
4. **Set up CORS** properly in nginx.conf
5. **Use IAM** for access control

## Troubleshooting

### Build Fails
```bash
# Check build logs
gcloud builds log <BUILD_ID>
```

### Container Won't Start
```bash
# Check container logs
gcloud run services logs read tripbuddy --limit 50
```

### 502/503 Errors
- Check if port 8080 is exposed
- Verify nginx is running
- Check health endpoint: `/health`

### Environment Variables Not Working
- Remember: Vite variables must be prefixed with `VITE_`
- They're baked into the build, not runtime
- Rebuild after changing variables

## Useful Commands

```bash
# Get service URL
gcloud run services describe tripbuddy --region us-central1 --format 'value(status.url)'

# Update service
gcloud run services update tripbuddy --region us-central1 --memory 1Gi

# Delete service
gcloud run services delete tripbuddy --region us-central1

# List all services
gcloud run services list
```

## Support

For issues:
1. Check Cloud Run logs
2. Verify API keys are correct
3. Test locally with Docker first
4. Check [Cloud Run documentation](https://cloud.google.com/run/docs)

## Next Steps

After deployment:
1. ✅ Test all features
2. ✅ Set up monitoring alerts
3. ✅ Configure custom domain
4. ✅ Set up CI/CD pipeline
5. ✅ Enable Cloud CDN for better performance

---

**Your app is now live on Google Cloud Run!** 🚀