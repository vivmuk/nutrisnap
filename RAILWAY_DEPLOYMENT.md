# Railway Deployment Guide for NutriSnap

This guide will help you deploy NutriSnap to Railway for production testing.

## Prerequisites

1. Railway account (sign up at https://railway.app)
2. GitHub account (to connect your repository)
3. MongoDB Atlas connection string (already configured)

## Step 1: Prepare Your Repository

1. Make sure all your code is committed to Git
2. Push to GitHub (if not already done)

## Step 2: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your NutriSnap repository
5. Railway will automatically detect it's a Node.js project

## Step 3: Configure Environment Variables

In Railway, go to your service → **Variables** tab and add:

### Backend Service Variables:
```
VENICE_API_KEY=lnWNeSg0pA_rQUooNpbfpPDBaj2vJnWol5WqKWrIEF
MONGODB_URI=mongodb+srv://blueeyesmoki_db_user:Ua9kVA8vdGUl72vZ@cluster0.lriesmr.mongodb.net/nutrisnap?retryWrites=true&w=majority
PORT=3001
NODE_ENV=production
```

### Frontend Service Variables:
```
VITE_API_BASE_URL=https://your-backend-service.railway.app
```

## Step 4: Deploy Backend Service

1. Railway will auto-detect the `server/` directory
2. If not, set the **Root Directory** to `server`
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm start`
5. Railway will automatically deploy

## Step 5: Deploy Frontend Service

1. Create a **new service** in the same project
2. Connect to the same GitHub repo
3. Set **Root Directory** to `.` (root)
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `npm run preview` (or use a static file server)
6. Add the `VITE_API_BASE_URL` variable pointing to your backend URL

## Step 6: Configure MongoDB Atlas Network Access

1. Go to MongoDB Atlas → **Network Access**
2. Add Railway's IP ranges OR use `0.0.0.0/0` (less secure but easier for testing)
3. For production, whitelist Railway's specific IPs

## Step 7: Get Your URLs

1. Backend: Railway will provide a URL like `https://your-backend.up.railway.app`
2. Frontend: Railway will provide a URL like `https://your-frontend.up.railway.app`
3. Update `VITE_API_BASE_URL` in frontend to match backend URL

## Alternative: Single Service Deployment

If you want to deploy both in one service:

1. Use a process manager like `pm2` or `concurrently`
2. Or deploy backend only and serve frontend as static files from backend

## Quick Railway Setup Script

Railway CLI (optional):
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## Environment Variables Summary

### Backend (.env or Railway Variables):
- `VENICE_API_KEY` - Your Venice AI API key
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `PORT` - Server port (Railway sets this automatically)
- `NODE_ENV=production` - Production mode

### Frontend (Railway Variables):
- `VITE_API_BASE_URL` - Your backend Railway URL

## Troubleshooting

### Backend won't start
- Check environment variables are set
- Check MongoDB Atlas IP whitelist
- Check Railway logs for errors

### Frontend can't connect to backend
- Verify `VITE_API_BASE_URL` is correct
- Check CORS settings in backend
- Ensure backend is deployed and running

### MongoDB connection fails
- Verify IP is whitelisted in Atlas
- Check connection string format
- Verify credentials are correct

## Cost

Railway offers:
- **Free tier**: $5 credit/month
- **Hobby plan**: $5/month for more resources
- Perfect for testing and small projects

## Next Steps After Deployment

1. Test image analysis
2. Test food log CRUD operations
3. Monitor Railway logs for any issues
4. Set up custom domain (optional)
5. Configure SSL (automatic with Railway)

## Notes

- Railway automatically handles HTTPS
- Environment variables are encrypted
- Automatic deployments on git push (if configured)
- Easy rollback if needed

