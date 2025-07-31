#!/bin/bash

# Vercel Build Script
# This script handles the build process for Vercel deployment

echo "🚀 Starting Vercel build process..."

# Set environment
export NODE_ENV=production

# Clear previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.vite/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --omit=dev --ignore-scripts

# Build the application
echo "🔨 Building application..."
npm run build

# Verify build output
if [ -d "dist" ]; then
    echo "✅ Build completed successfully!"
    echo "📊 Build size:"
    du -sh dist/
else
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "🎉 Vercel build process completed!"
