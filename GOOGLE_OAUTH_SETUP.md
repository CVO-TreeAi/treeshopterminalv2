# Google OAuth Configuration for TreeShop Terminal

## Required Redirect URIs

Add ALL of these to your Google Cloud Console OAuth 2.0 Client:

### Production (treeshopterminal.com)
```
https://treeshopterminal.com/api/auth/callback/google
```

### Vercel Preview URLs (for testing)
```
https://treeshop-terminal-a9uhpbau7-jeremiah-andersons-projects.vercel.app/api/auth/callback/google
```

### Local Development
```
http://localhost:3003/api/auth/callback/google
```

## Steps to Update Google OAuth:

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com/

2. **Navigate to APIs & Services > Credentials**

3. **Find your OAuth 2.0 Client ID**
   - Client ID: `1055605414289-lnn7q1i8p7ikgqnt2lg55u8m9h2er9q6.apps.googleusercontent.com`

4. **Click to Edit the OAuth Client**

5. **Add Authorized Redirect URIs**
   - Add all the URIs listed above
   - Make sure to include the `/api/auth/callback/google` path

6. **Add Authorized JavaScript Origins**
   ```
   https://treeshopterminal.com
   https://treeshop-terminal-a9uhpbau7-jeremiah-andersons-projects.vercel.app
   http://localhost:3003
   ```

7. **Save the Changes**

## Current Configuration:
- **Client ID:** 1055605414289-lnn7q1i8p7ikgqnt2lg55u8m9h2er9q6.apps.googleusercontent.com
- **Client Secret:** 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
- **Authorized User:** office@fltreeshop.com only

## Troubleshooting:

If you still get "invalid_client" error:
1. Make sure the redirect URI matches EXACTLY (including https:// and trailing paths)
2. Wait 5-10 minutes for Google to propagate changes
3. Clear your browser cache/cookies
4. Try incognito/private browsing mode

## Test the Configuration:
1. Visit https://treeshopterminal.com
2. Click "Sign in with Google"
3. Use office@fltreeshop.com account
4. Should redirect back to Terminal dashboard