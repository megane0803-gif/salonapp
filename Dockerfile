# Gmail Integration Web Application - Production Docker Build
# Based on Playwright official image for reliable browser automation support

# Use Playwright's official Node.js image as base
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY . .

# Create necessary directories
RUN mkdir -p logs public/static dist

# Build the application
RUN npm run build

# Install PM2 globally for process management
RUN npm install -g pm2

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Change ownership of app directory
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Production startup command
# Uses PM2 to manage the Wrangler Pages dev server in production mode
CMD ["pm2-runtime", "start", "ecosystem.config.cjs", "--env", "production"]

# Alternative startup methods (commented out):
# Direct wrangler command:
# CMD ["npx", "wrangler", "pages", "dev", "dist", "--port", "3000", "--ip", "0.0.0.0"]

# Development mode with file watching:
# CMD ["npm", "run", "dev:d1"]

# Build information
LABEL maintainer="Gmail Integration App"
LABEL version="1.0.0"
LABEL description="Gmail API integration with Cloudflare Workers and D1 database"
LABEL org.opencontainers.image.source="https://github.com/username/webapp"
