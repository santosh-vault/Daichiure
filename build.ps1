# Vercel Build Script (PowerShell)
# This script handles the build process for Vercel deployment

Write-Host "🚀 Starting Vercel build process..." -ForegroundColor Green

# Set environment
$env:NODE_ENV = "production"

# Clear previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "node_modules\.vite") { Remove-Item -Recurse -Force "node_modules\.vite" }

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm ci --omit=dev --ignore-scripts

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Build the application
Write-Host "🔨 Building application..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Verify build output
if (Test-Path "dist") {
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    Write-Host "📊 Build output:" -ForegroundColor Yellow
    Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum | ForEach-Object {
        Write-Host "Total size: $([math]::Round($_.Sum / 1MB, 2)) MB"
    }
} else {
    Write-Host "❌ Build failed - dist directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Vercel build process completed!" -ForegroundColor Green
