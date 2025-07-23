# Email Verification Configuration

## Issue

Email verification works on localhost but not on the live website (daichiure.vercel.app).

## Root Cause

Supabase Auth needs to be configured with the correct Site URL and Redirect URLs for your production domain.

## Solution

### 1. Configure Supabase Dashboard Settings

Go to your [Supabase Dashboard](https://supabase.com/dashboard) and follow these steps:

1. **Navigate to Authentication Settings:**

   - Go to your project: `aepxsvgcoraegvbnhplu`
   - Click on "Authentication" in the sidebar
   - Click on "Settings"

2. **Configure Site URL:**

   - Set "Site URL" to: `https://daichiure.vercel.app`

3. **Configure Redirect URLs:**
   Add these URLs to "Redirect URLs":

   ```
   https://daichiure.vercel.app/verify-email
   https://daichiure.vercel.app/login
   http://localhost:5173/verify-email
   http://localhost:5173/login
   ```

4. **Email Settings:**
   - Ensure "Enable email confirmations" is checked
   - You can customize email templates if needed

### 2. Code Changes Made

✅ **AuthContext.tsx**: Updated signup function to use dynamic redirect URLs based on environment
✅ **EmailVerification.tsx**: Created component to handle email verification callbacks
✅ **App.tsx**: Added route for email verification page

### 3. How It Works Now

1. **Development (localhost:5173):**

   - Uses `http://localhost:5173/login` as redirect URL
   - Email verification links work locally

2. **Production (daichiure.vercel.app):**
   - Uses `https://daichiure.vercel.app/login` as redirect URL
   - Email verification links work on live site

### 4. Testing

1. **Deploy to Vercel:**

   ```bash
   npm run build
   # Deploy to Vercel
   ```

2. **Test signup on production:**
   - Go to https://daichiure.vercel.app/register
   - Create account with valid email
   - Check email for verification link
   - Click link - should redirect to production site

### 5. Environment Variables

Ensure these are set in Vercel:

```
VITE_SUPABASE_URL=https://aepxsvgcoraegvbnhplu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Verification Flow

1. User signs up → Account created with `email_confirmed_at: null`
2. Supabase sends email with verification link to configured redirect URL
3. User clicks link → Redirected to `/verify-email` page with tokens
4. EmailVerification component processes tokens and confirms email
5. User is signed in and redirected to games page

## Important Notes

- The Supabase dashboard configuration is the most critical step
- Without proper redirect URLs, email links will fail on production
- The code now automatically detects environment and uses correct URLs
- Email verification is required before users can sign in
