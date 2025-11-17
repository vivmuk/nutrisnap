# Railway Deployment - Quick Start Checklist

## ✅ Step 1: Sign Up & Connect GitHub

1. Go to https://railway.app and sign up (use GitHub login)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose **vivmuk/nutrisnap** repository
5. Railway will detect it's a Node.js project

## ✅ Step 2: Deploy Backend Service

1. Railway should auto-detect the `server/` folder
2. If not, click on the service → **Settings** → Set **Root Directory** to `server`
3. Go to **Variables** tab and add these environment variables:

```
VENICE_API_KEY=lnWNeSg0pA_rQUooNpbfpPDBaj2vJnWol5WqKWrIEF
MONGODB_URI=mongodb+srv://blueeyesmoki_db_user:Ua9kVA8vdGUl72vZ@cluster0.lriesmr.mongodb.net/nutrisnap?retryWrites=true&w=majority
NODE_ENV=production
```

4. Railway will automatically:
   - Run `npm install`
   - Run `npm run build` (from package.json)
   - Run `npm start` (from package.json)
5. Wait for deployment to complete
6. **Copy the generated URL** (e.g., `https://nutrisnap-backend.up.railway.app`)

## ✅ Step 3: Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for testing) OR add Railway's IP ranges
4. Click **"Confirm"**

## ✅ Step 4: Deploy Frontend Service

1. In Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select the same **vivmuk/nutrisnap** repository again
3. Go to **Settings** → Set **Root Directory** to `.` (root directory)
4. Go to **Variables** tab and add:

```
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

   ⚠️ **Replace `your-backend-url` with the actual backend URL from Step 2**

5. Go to **Settings** → **Build & Deploy**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
6. Wait for deployment
7. **Copy the frontend URL**

## ✅ Step 5: Update Frontend Environment Variable

1. Go back to Frontend service → **Variables**
2. Update `VITE_API_BASE_URL` with the correct backend URL
3. Railway will automatically redeploy

## ✅ Step 6: Test Your Deployment

1. Open your frontend URL in a browser
2. Try uploading a food image
3. Check if it analyzes correctly
4. Test the dashboard

## 🎯 Quick Reference

### Backend Service Settings:
- **Root Directory**: `server`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start` (auto-detected)

### Frontend Service Settings:
- **Root Directory**: `.` (root)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run preview`

### Required Environment Variables:

**Backend:**
- `VENICE_API_KEY`
- `MONGODB_URI`
- `NODE_ENV=production`

**Frontend:**
- `VITE_API_BASE_URL` (your backend Railway URL)

## 🔧 Troubleshooting

### Backend won't start?
- Check Railway logs (click on service → **Deployments** → **View Logs**)
- Verify all environment variables are set
- Check MongoDB Atlas IP whitelist

### Frontend can't connect?
- Verify `VITE_API_BASE_URL` matches your backend URL exactly
- Check backend is running and accessible
- Look at browser console for CORS errors

### MongoDB connection fails?
- Ensure `0.0.0.0/0` is whitelisted in Atlas Network Access
- Verify connection string is correct
- Check Railway logs for connection errors

## 💰 Cost

- **Free tier**: $5 credit/month (perfect for testing)
- **Hobby**: $5/month (if you need more)

## 🚀 That's It!

Your app should now be live on Railway! 🎉

