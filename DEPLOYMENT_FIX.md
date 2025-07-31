# Vercel Deployment Troubleshooting

## Fixed Issues ✅

### 1. Missing Public Directory Error

**Problem**: Vercel was looking for a `public` directory but Vite builds to `dist`.
**Solution**: Updated `vercel.json` to specify:

- `"buildCommand": "npm run build"`
- `"outputDirectory": "dist"`

### 2. Category Filtering on Games Page

**Problem**: Sidebar categories weren't filtering games properly.
**Solution**:

- Updated sidebar to link to `/games?category=${categorySlug}`
- Updated Games page to read category from URL parameters
- Games now filter correctly when clicking sidebar categories

## Current Configuration

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  }
}
```

### Required Environment Variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Deployment Steps

1. **Add Environment Variables**:

   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add the required Supabase variables

2. **Deploy**:

   ```bash
   git add .
   git commit -m "Fix Vercel deployment configuration"
   git push
   ```

3. **Or use Vercel CLI**:
   ```bash
   vercel --prod
   ```

## Build Verification

The build process now correctly:

- ✅ Builds to `dist` directory
- ✅ Includes all static assets
- ✅ TypeScript compiles without errors
- ✅ Categories filter games properly
- ✅ SPA routing configured with rewrites

## Need Help?

If deployment still fails:

1. Check Vercel build logs for specific errors
2. Verify environment variables are set
3. Ensure GitHub repository is properly connected
4. Check that build command runs locally: `npm run build`
