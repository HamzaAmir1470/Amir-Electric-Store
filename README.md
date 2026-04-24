# Amir Electric Store - Production Deployment Guide

This repository contains:
- `Backend` (Node.js API, now Cloudflare Worker ready)
- `FrontEnd` (React + Vite app, Cloudflare Pages ready)

## 1) Backend (Cloudflare Workers)

### Prerequisites
- Cloudflare account
- `wrangler` access (CLI login)
- MongoDB Atlas connection string

### Backend files added/updated
- `Backend/worker.mjs` (Worker entrypoint with all API routes)
- `Backend/wrangler.toml` (Worker config)
- `Backend/.env.example` (required variables)

### Required backend secrets/vars
Set these in Cloudflare Worker settings (or with Wrangler):
- `MONGO_URL`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `CORS_ORIGINS` (comma-separated frontend domains)

### Deploy steps
1. Open terminal in backend:
   ```bash
   cd Backend
   ```
2. Login to Cloudflare:
   ```bash
   npx wrangler login
   ```
3. Set secrets:
   ```bash
   npx wrangler secret put MONGO_URL
   npx wrangler secret put JWT_SECRET
   npx wrangler secret put EMAIL_USER
   npx wrangler secret put EMAIL_PASS
   ```
4. Set public var (if needed):
   - Edit `wrangler.toml` `[vars] CORS_ORIGINS = "https://your-frontend.pages.dev"`
5. Deploy:
   ```bash
   npm run cf:deploy
   ```
6. Copy Worker URL (example):
   `https://amir-electric-store-backend.<subdomain>.workers.dev`

## 2) Frontend (Cloudflare Pages)

### Frontend files added/updated
- `FrontEnd/public/_redirects` (SPA fallback routing)
- `FrontEnd/.env.example`
- `FrontEnd/src/main.jsx` (runtime API base URL support)

### Important env var
Set this in Cloudflare Pages project settings:
- `VITE_API_BASE_URL=https://<your-worker-url>`

### Deploy steps
1. Push repository to GitHub.
2. In Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**.
3. Select this repository and set:
   - **Root directory:** `FrontEnd`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Add env var:
   - `VITE_API_BASE_URL=https://<your-worker-url>`
5. Deploy.

## 3) Post-deploy checklist

1. Update backend `CORS_ORIGINS` to include your Pages domain.
2. Test these URLs:
   - Backend health: `GET /ping`
   - Frontend login/signup and dashboard API actions
3. If using custom domains:
   - Attach custom domain on Worker
   - Attach custom domain on Pages
   - Update `VITE_API_BASE_URL` to custom API domain

## 4) Local development

### Backend
```bash
cd Backend
cp .env.example .env
npm install
npm run start
```

### Frontend
```bash
cd FrontEnd
cp .env.example .env
npm install
npm run dev
```

`VITE_API_BASE_URL` defaults to `http://localhost:8080` if not set.
