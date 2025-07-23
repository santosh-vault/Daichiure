#!/bin/bash

# Script to configure Supabase Auth settings for production deployment

echo "Configuring Supabase Auth settings..."

# Set the site URL to your production domain
echo "Setting Site URL to https://daichiure.vercel.app"

# Note: You need to run these commands manually in your Supabase dashboard
# or use the Supabase CLI if you have admin access

echo "Please configure the following in your Supabase Dashboard:"
echo "1. Go to Authentication > Settings in your Supabase dashboard"
echo "2. Set 'Site URL' to: https://daichiure.vercel.app"
echo "3. Add these redirect URLs:"
echo "   - https://daichiure.vercel.app/verify-email"
echo "   - https://daichiure.vercel.app/login"
echo "   - http://localhost:5173/verify-email (for local development)"
echo "   - http://localhost:5173/login (for local development)"
echo ""
echo "4. Make sure 'Enable email confirmations' is enabled"
echo "5. Optionally, you can customize the email templates"

# Also create environment variables for production
echo ""
echo "For Vercel deployment, make sure these environment variables are set:"
echo "VITE_SUPABASE_URL=${VITE_SUPABASE_URL}"
echo "VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}"
