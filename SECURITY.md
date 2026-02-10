# Security Best Practices

## ⚠️ API Key Protection

### What NOT to Do
❌ **Never** share your API key in chat, email, or messages  
❌ **Never** commit `config.js` to Git  
❌ **Never** post code with API keys to forums/Stack Overflow  
❌ **Never** hardcode API keys in files you share  

### What TO Do
✅ Store API keys in `config.js` (which is in `.gitignore`)  
✅ Revoke and regenerate keys if accidentally exposed  
✅ Use environment variables for production deployments  
✅ Keep `config.js` local to your machine only  

## Current Setup

Your API key is now stored in `config.js`, which is:
- **Ignored by Git** (won't be committed)
- **Loaded at runtime** by the HTML file
- **Separate from your code** (easier to manage)

## If You Accidentally Exposed Your Key

1. **Immediately revoke it**: https://aistudio.google.com/app/apikey
2. **Generate a new key**
3. **Update `config.js`** with the new key
4. **Never share the new key**

## For Production (When You Deploy)

When you're ready to deploy this app:

### Option 1: Backend Server (Recommended)
- Move API calls to a Node.js/Python backend
- Store API key in server environment variables
- Frontend calls your backend, not Gemini directly

### Option 2: Serverless Functions
- Use Vercel/Netlify serverless functions
- Store API key in platform environment variables
- Frontend calls your function, function calls Gemini

### Option 3: Firebase/Supabase
- Use Firebase Cloud Functions or Supabase Edge Functions
- Store secrets in their secret management systems
- Never expose keys to the client

## Current Risk Level

**For Personal Testing**: ✅ Low risk (config.js is local only)  
**For Sharing**: ⚠️ Medium risk (anyone with file access can see key)  
**For Production**: ❌ High risk (need proper backend)

## Next Steps

1. **Right now**: Revoke the key you shared in chat
2. **Create new key**: Get a fresh one from Google AI Studio
3. **Add to config.js**: Put it in the config file (not parser.js)
4. **Test locally**: Make sure it works
5. **Later**: Build a proper backend before sharing publicly
