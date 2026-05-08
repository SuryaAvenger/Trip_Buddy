# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Accept build arguments for environment variables
ARG VITE_GEMINI_API_KEY
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_GOOGLE_CALENDAR_CLIENT_ID
ARG VITE_GOOGLE_SHEETS_CLIENT_ID
ARG VITE_GOOGLE_API_SCOPE="https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets"

# Set environment variables for build
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_GOOGLE_CALENDAR_CLIENT_ID=$VITE_GOOGLE_CALENDAR_CLIENT_ID
ENV VITE_GOOGLE_SHEETS_CLIENT_ID=$VITE_GOOGLE_SHEETS_CLIENT_ID
ENV VITE_GOOGLE_API_SCOPE=$VITE_GOOGLE_API_SCOPE

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Made with Bob
