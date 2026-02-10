# Gemini API Setup Guide

## Step 1: Get Your Gemini API Key

1. **Go to Google AI Studio**:
   - Visit: https://aistudio.google.com/app/apikey
   - Sign in with your Google account (the one with Gemini Pro access)

2. **Create API Key**:
   - Click "Get API Key" or "Create API Key"
   - Click "Create API key in new project" (or select existing project)
   - Copy the API key (starts with `AIza...`)
   - ⚠️ **Keep this secret!** Don't share it publicly

3. **Save Your API Key**:
   - You'll paste this into the app in the next step

## Step 2: Add API Key to Your App

1. **Open** `parser-prototype.html` in a text editor
2. **Find** this line near the top of the `<script>` section:
   ```javascript
   const GEMINI_API_KEY = 'YOUR_API_KEY_HERE';
   ```
3. **Replace** `YOUR_API_KEY_HERE` with your actual API key:
   ```javascript
   const GEMINI_API_KEY = 'AIzaSyD...your-actual-key...';
   ```
4. **Save** the file

## Step 3: Test It!

1. **Open** `parser-prototype.html` in your browser
2. **Click** one of the sample email buttons (Flight, Hotel, Rental)
3. **Click** "Parse Email"
4. **Wait** 2-5 seconds for Gemini to process
5. **See** real AI-parsed JSON output!

## Pricing & Limits

### Free Tier (Gemini 1.5 Flash)
- **1,500 requests per day** - FREE
- **1 million tokens per month** - FREE
- Perfect for testing and personal use

### Paid Tier (if you exceed free limits)
- **$0.075 per 1 million input tokens**
- **$0.30 per 1 million output tokens**
- Roughly **$0.001 per email** = $1 per 1,000 emails

### Your Gemini Pro Subscription
Your Gemini Pro subscription is for the **chat interface** (gemini.google.com). The **API** is separate:
- API has its own free tier (listed above)
- API usage is billed separately
- You can use the API even with a free Google account

## Troubleshooting

### "API key not valid"
- Make sure you copied the entire key (starts with `AIza`)
- Check for extra spaces before/after the key
- Regenerate the key at https://aistudio.google.com/app/apikey

### "CORS error" or "blocked by browser"
- This is expected for local files
- **Solution**: Use a local web server (see below)

### Running a Local Web Server
If you get CORS errors, run this in your TravelHax folder:

**Option 1 - Python** (if installed):
```bash
python -m http.server 8000
```
Then visit: http://localhost:8000/parser-prototype.html

**Option 2 - Node.js** (if installed):
```bash
npx http-server -p 8000
```
Then visit: http://localhost:8000/parser-prototype.html

**Option 3 - VS Code**:
- Install "Live Server" extension
- Right-click `parser-prototype.html`
- Click "Open with Live Server"

## Security Warning ⚠️

**Current setup is for TESTING ONLY**:
- Your API key is visible in the browser
- Anyone who views the page source can steal it
- Only use for personal testing

**For production** (sharing with others):
- Move API calls to a backend server
- Never expose your API key in frontend code
- See `README.md` for server setup instructions

## Next Steps

Once you've tested successfully:
1. Try pasting your own real travel emails
2. Check the confidence scores
3. Refine the prompts if needed
4. Consider building a proper backend for security
