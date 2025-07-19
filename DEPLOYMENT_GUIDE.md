# Rewards System Deployment Guide

## Prerequisites
1. Supabase CLI installed: `npm install -g supabase`
2. Supabase project created and linked
3. Environment variables configured

## Step 1: Link Your Supabase Project

```bash
# Link your project (you'll need your project ref and access token)
supabase link --project-ref YOUR_PROJECT_REF
```

## Step 2: Deploy Database Migration

```bash
# Deploy the rewards system migration
supabase db push
```

## Step 3: Deploy Edge Functions

```bash
# Deploy all reward functions
supabase functions deploy award-coins
supabase functions deploy get-reward-data
supabase functions deploy process-referral
```

## Step 4: Set Environment Variables

Make sure your `.env` file has these variables:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 5: Update All Games

Add the `useGameCoins` hook to all your games. Here's the pattern:

```tsx
import { useGameCoins } from '../hooks/useGameCoins';

// Inside your game component
useGameCoins({
  gameId: 'your-game-id',
  trigger: gameState === 'gameOver', // or whatever condition indicates game completion
  score: Math.floor(score),
  duration: Math.floor((Date.now() - gameStartTime) / 1000)
});
```

## Step 6: Test the System

1. **Login Test**: Sign in with a regular user (not admin) - should award 100 coins
2. **Game Test**: Complete a game - should award 20 coins
3. **Rewards Dashboard**: Visit `/rewards` - should show coin balance and progress
4. **Referral Test**: Use a referral code - should award 1000 coins to referrer

## Troubleshooting

### Common Issues:

1. **Functions not deploying**: Make sure you're linked to the correct project
2. **CORS errors**: Functions are configured to allow all origins
3. **Database errors**: Check if migration was applied successfully
4. **Auth errors**: Ensure user is authenticated before calling functions

### Debug Commands:

```bash
# Check function logs
supabase functions logs award-coins

# Check database status
supabase db status

# List deployed functions
supabase functions list
```

## Verification Checklist

- [ ] Database migration applied successfully
- [ ] All three functions deployed
- [ ] Environment variables set correctly
- [ ] Login awards coins for regular users
- [ ] Games award coins on completion
- [ ] Rewards dashboard displays correctly
- [ ] Referral system works
- [ ] Admin users don't see rewards
- [ ] Daily limits work correctly
- [ ] Fair coin redemption works

## Next Steps

After deployment, you can:
1. Add comment functionality with coin rewards
2. Add blog sharing with coin rewards
3. Implement weekly fair coin distribution
4. Add more game integrations
5. Create admin tools for managing rewards

## Support

If you encounter issues:
1. Check Supabase dashboard for function logs
2. Verify database schema in Supabase dashboard
3. Test functions individually using the Supabase dashboard
4. Check browser console for frontend errors 