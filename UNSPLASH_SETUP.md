# Unsplash API Setup Guide

## Getting Your Free API Key

1. **Sign up for Unsplash Developers**
   - Go to [https://unsplash.com/developers](https://unsplash.com/developers)
   - Click "Register as a developer"
   - Create an account or log in

2. **Create a New Application**
   - Go to your [Applications page](https://unsplash.com/oauth/applications)
   - Click "New Application"
   - Accept the API Use and Guidelines
   - Fill in the application details:
     - Application name: "LeafSwipe" (or your choice)
     - Description: "Tree recommendation app for Kenya"
   - Click "Create application"

3. **Get Your Access Key**
   - On your application page, you'll see your **Access Key**
   - Copy this key

4. **Add to Your Project**
   - Create a `.env` file in the project root (if it doesn't exist)
   - Add your key:
     ```
     VITE_UNSPLASH_ACCESS_KEY=your_access_key_here
     ```
   - **Important**: Never commit your `.env` file to git!

5. **For Netlify Deployment**
   - Go to your Netlify dashboard
   - Navigate to: Site settings → Build & deploy → Environment
   - Add environment variable:
     - Key: `VITE_UNSPLASH_ACCESS_KEY`
     - Value: Your Unsplash access key
   - Save and redeploy

## API Limits

**Free Tier:**
- 50 requests per hour
- 5,000 requests per month

**How We Handle Limits:**
- Images are cached in localStorage for 7 days
- Only fetches images once per tree
- Fallback to placeholder images if API fails

## Testing Without API Key

The app will work without an API key by using placeholder images. To test with real images, you must add your Unsplash API key.

## Troubleshooting

**Images not loading?**
1. Check your API key is correct in `.env`
2. Restart your dev server after adding the key
3. Check browser console for errors
4. Verify you haven't exceeded rate limits

**Rate limit exceeded?**
- Wait an hour for the limit to reset
- Images will use cached versions or placeholders
- Consider upgrading to Unsplash Plus for higher limits
