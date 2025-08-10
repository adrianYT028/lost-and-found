# Lost and Found V2 - Fresh Deployment

This is a fresh deployment to bypass Vercel cache issues.

## Deploy Instructions:

1. Create NEW Vercel project
2. Import from: adrianYT028/lost-and-found
3. Project name: `lost-found-fresh` 
4. Configure build settings:
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/build`
   - Root Directory: leave blank

## Environment Variables to Add:
- SUPABASE_URL
- SUPABASE_ANON_KEY  
- JWT_SECRET

## Expected URLs after deployment:
- Frontend: https://lost-found-fresh.vercel.app
- API: https://lost-found-fresh.vercel.app/api/items

Version: 2.0.0 - Fresh deployment
