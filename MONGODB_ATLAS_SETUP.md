# MongoDB Atlas Setup Guide

This guide will walk you through setting up MongoDB Atlas for your NutriSnap application.

## Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Click **"Try Free"** or **"Sign Up"**
3. Fill in your information:
   - Email address
   - Password
   - First and Last name
4. Accept the terms and conditions
5. Click **"Create your Atlas account"**
6. Verify your email address if prompted

## Step 2: Create a New Cluster

1. After logging in, you'll be asked to **"Build a Database"**
2. Choose a deployment option:
   - **M0 FREE** (Recommended for development) - Free tier with 512MB storage
   - Click **"Create"** on the Free tier option
3. Select a Cloud Provider and Region:
   - Choose the provider closest to you (AWS, Google Cloud, or Azure)
   - Select a region close to your location for better performance
   - Click **"Create Cluster"**
4. Wait for the cluster to be created (takes 1-3 minutes)

## Step 3: Create a Database User

1. While the cluster is being created, you'll see a **"Create Database User"** screen
2. Choose **"Password"** authentication method
3. Enter a username (e.g., `nutrisnap-user`)
4. Enter a strong password (save this securely!)
5. Click **"Create Database User"**

**Important**: Save your username and password - you'll need them for the connection string!

## Step 4: Configure Network Access (IP Whitelist)

1. You'll see a **"Where would you like to connect from?"** screen
2. For development, click **"Add My Current IP Address"**
   - This allows your current IP to connect
3. For production or if you want to allow all IPs (less secure):
   - Click **"Allow Access from Anywhere"**
   - Enter `0.0.0.0/0` in the IP address field
   - Click **"Confirm"**

**Security Note**: For production, only whitelist specific IP addresses.

## Step 5: Get Your Connection String

1. After completing the setup, click **"Finish and Close"**
2. You'll be taken to the Atlas dashboard
3. Click **"Connect"** button on your cluster
4. Choose **"Connect your application"**
5. Select:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
6. Copy the connection string - it will look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Configure Your Application

### Option A: Automated Setup (Recommended)

Use the setup script to automatically configure your connection:

```bash
npm run setup-atlas
```

The script will:
- Guide you through the setup process
- Validate your connection string
- Update your `server/.env` file automatically
- Optionally test the connection

### Option B: Manual Setup

1. Replace `<username>` and `<password>` in the connection string with your actual credentials
2. Add a database name at the end (before the `?`):
   ```
   mongodb+srv://nutrisnap-user:yourpassword@cluster0.xxxxx.mongodb.net/nutrisnap?retryWrites=true&w=majority
   ```

3. Update your `server/.env` file:
   ```env
   VENICE_API_KEY=lnWNeSg0pA_rQUooNpbfpPDBaj2vJnWol5WqKWrIEF
   MONGODB_URI=mongodb+srv://nutrisnap-user:yourpassword@cluster0.xxxxx.mongodb.net/nutrisnap?retryWrites=true&w=majority
   PORT=3001
   ```

## Step 7: Test the Connection

### Quick Test (Recommended)

Test your connection without starting the full server:

```bash
npm run test-mongodb
```

Or from the server directory:
```bash
cd server
npm run test-connection
```

### Full Server Test

1. Start your backend server:
   ```bash
   cd server
   npm run dev
   ```

2. You should see:
   ```
   MongoDB connected successfully
   Server running on port 3001
   ```

3. If you see connection errors, check:
   - Your IP address is whitelisted in Atlas
   - Username and password are correct
   - Connection string format is correct

## Additional Atlas Features

### View Your Data

1. In Atlas dashboard, click **"Browse Collections"**
2. You can view, edit, and delete documents directly from the Atlas UI

### Monitor Your Cluster

1. Click on your cluster name
2. View metrics like:
   - CPU usage
   - Memory usage
   - Storage usage
   - Connection count

### Database Access Management

1. Go to **"Database Access"** in the left sidebar
2. Manage users, roles, and permissions

### Network Access Management

1. Go to **"Network Access"** in the left sidebar
2. Add or remove IP addresses from the whitelist

## Troubleshooting

### Connection Timeout

**Problem**: `MongooseServerSelectionError: connect ETIMEDOUT`

**Solutions**:
- Check your IP address is whitelisted
- Verify your internet connection
- Try using `0.0.0.0/0` temporarily (less secure) to test

### Authentication Failed

**Problem**: `MongoServerError: Authentication failed`

**Solutions**:
- Double-check username and password in connection string
- Ensure special characters in password are URL-encoded
- Create a new database user if needed

### Connection String Format

**Correct Format**:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Common Mistakes**:
- Missing database name
- Incorrect password encoding
- Wrong cluster URL

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong passwords** for database users
3. **Limit IP whitelist** to only necessary IPs
4. **Use environment variables** for connection strings
5. **Rotate passwords** periodically
6. **Use separate users** for development and production

## Free Tier Limitations

The M0 Free tier includes:
- 512 MB storage
- Shared RAM and vCPU
- No backup (manual backups only)
- Limited to 1 cluster

**Upgrade when**:
- You exceed 512 MB storage
- You need automated backups
- You need better performance
- You need multiple clusters

## Next Steps

Once Atlas is configured:

1. ✅ Your connection string is in `server/.env`
2. ✅ Start your backend server
3. ✅ Test by creating a food log in the app
4. ✅ Verify data appears in Atlas "Browse Collections"

Your NutriSnap app is now using cloud-hosted MongoDB! 🎉

