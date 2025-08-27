# OAuth Debug Checklist for TreeShop Terminal

## Current Issue
"Error 401: invalid_client" when trying to sign in with Google at treeshopterminal.com

## OAuth Client Details
- **Client ID:** `1055605414289-lnn7q1i8p7ikgqnt2lg55u8m9h2er9q6.apps.googleusercontent.com`
- **Client Secret:** `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`

## Required Google Cloud Console Settings

### 1. OAuth 2.0 Client Type
Must be: **Web application**

### 2. Authorized JavaScript origins
Make sure ALL of these are added:
```
https://treeshopterminal.com
https://www.treeshopterminal.com
http://localhost:3003
```

### 3. Authorized redirect URIs  
Make sure ALL of these are added EXACTLY as shown:
```
https://treeshopterminal.com/api/auth/callback/google
https://www.treeshopterminal.com/api/auth/callback/google
http://localhost:3003/api/auth/callback/google
```

## Common Issues & Solutions

### Issue 1: Wrong OAuth Application
- Make sure you're editing the correct OAuth 2.0 Client ID in Google Cloud Console
- The client ID should match: `1055605414289-lnn7q1i8p7ikgqnt2lg55u8m9h2er9q6`

### Issue 2: OAuth App Might Be Disabled
1. Go to Google Cloud Console
2. Check if the OAuth consent screen is published (not in testing mode)
3. Make sure the app is not disabled or deleted

### Issue 3: Wrong Project
- Verify you're in the correct Google Cloud Project
- Project might be different from what you expect

### Issue 4: Credentials Not Matching
The error "invalid_client" specifically means Google doesn't recognize this client ID/secret combination.

## Alternative Solution - Create New OAuth Credentials

If the above doesn't work, create NEW OAuth credentials:

1. Go to https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Create Credentials → OAuth client ID
4. Application type: Web application
5. Name: TreeShop Terminal Production
6. Add JavaScript origins:
   - https://treeshopterminal.com
   - https://www.treeshopterminal.com
7. Add redirect URIs:
   - https://treeshopterminal.com/api/auth/callback/google
   - https://www.treeshopterminal.com/api/auth/callback/google
8. Save and copy the new Client ID and Secret
9. Update them in Vercel environment variables

## Test URLs
After fixing, test here:
- https://treeshopterminal.com
- Click "Sign in with Google"
- Should redirect to Google OAuth
- After auth, should redirect back to Terminal

## Vercel Environment Variables to Update
If you create new credentials, update these:
```bash
npx vercel env rm GOOGLE_CLIENT_ID production --yes
npx vercel env rm GOOGLE_CLIENT_SECRET production --yes
echo "NEW_CLIENT_ID" | npx vercel env add GOOGLE_CLIENT_ID production
echo "NEW_CLIENT_SECRET" | npx vercel env add GOOGLE_CLIENT_SECRET production
npx vercel --prod --yes
```