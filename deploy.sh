#!/bin/bash

# TripBuddy - Google Cloud Run Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 TripBuddy - Google Cloud Run Deployment"
echo "=========================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file with your API keys"
    exit 1
fi

# Load environment variables
source .env

# Check required variables
if [ -z "$VITE_GEMINI_API_KEY" ]; then
    echo "❌ Error: VITE_GEMINI_API_KEY not set in .env"
    exit 1
fi

if [ -z "$VITE_GOOGLE_MAPS_API_KEY" ]; then
    echo "❌ Error: VITE_GOOGLE_MAPS_API_KEY not set in .env"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: No GCP project set"
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📦 Project: $PROJECT_ID"
echo "🌍 Region: us-central1"
echo ""

# Confirm deployment
read -p "Deploy to Cloud Run? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "🔨 Building and deploying..."
echo ""

# Submit build with environment variables
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=\
_VITE_GEMINI_API_KEY="$VITE_GEMINI_API_KEY",\
_VITE_GOOGLE_MAPS_API_KEY="$VITE_GOOGLE_MAPS_API_KEY",\
_VITE_GOOGLE_CALENDAR_CLIENT_ID="$VITE_GOOGLE_CALENDAR_CLIENT_ID",\
_VITE_GOOGLE_SHEETS_CLIENT_ID="$VITE_GOOGLE_SHEETS_CLIENT_ID"

# Get service URL
SERVICE_URL=$(gcloud run services describe tripbuddy \
  --region us-central1 \
  --format 'value(status.url)' 2>/dev/null || echo "")

echo ""
echo "✅ Deployment complete!"
echo ""

if [ ! -z "$SERVICE_URL" ]; then
    echo "🌐 Your app is live at:"
    echo "   $SERVICE_URL"
    echo ""
    echo "📊 View logs:"
    echo "   gcloud run services logs read tripbuddy --region us-central1"
    echo ""
    echo "🔍 View in console:"
    echo "   https://console.cloud.google.com/run/detail/us-central1/tripbuddy"
else
    echo "⚠️  Could not retrieve service URL"
    echo "Check Cloud Console: https://console.cloud.google.com/run"
fi

echo ""
echo "🎉 Done!"

# Made with Bob
