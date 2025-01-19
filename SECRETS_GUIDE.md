# 🔐 EonXRP Deployment Secrets Guide

## 1. Railway Token
- Go to [Railway Dashboard](https://railway.app)
- Click on your profile (bottom left)
- Navigate to Account Settings
- Generate a new Personal Access Token
- Copy the entire token

## 2. Railway Project ID
- Open your Railway project
- Look at the project URL
- The last segment is your Project ID
- Example: `railway.app/project/abc123` → Project ID is `abc123`

## 3. Vercel Token
- Go to [Vercel Dashboard](https://vercel.com)
- Click on Account Settings
- Navigate to Tokens section
- Generate a new token
- Copy the entire token

## 4. Vercel Organization ID
- In Vercel Dashboard
- Go to Settings > General
- Find "Organization ID" 
- Copy this value

## 5. Vercel Project ID
- In your Vercel project
- Go to Project Settings
- Find "Project ID"
- Copy this value

## GitHub Secrets Setup
1. Go to your GitHub repository
2. Click "Settings"
3. Select "Secrets and variables"
4. Click "New repository secret"
5. Add each secret with its corresponding value

### Required Secrets
- `RAILWAY_TOKEN`
- `RAILWAY_PROJECT_ID`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

*Keep these secrets confidential!* 🕵️‍♂️
