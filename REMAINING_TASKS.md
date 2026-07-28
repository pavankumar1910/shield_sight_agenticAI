# 🚀 ShieldSight — Deployment Instructions (Render + HuggingFace)

> **Stack**: Vercel (frontend) + Render (backend) + Firebase (auth) + HuggingFace Hub (ML models)
> All **FREE FOREVER** — no credit card required.

---

## ✅ Already Done (Code Changes)

- [x] `render.yaml` created for Render deployment
- [x] `requirements.txt` updated with `huggingface-hub` + `psutil`
- [x] `main.py` reads `PORT` from environment variable
- [x] `ml_model.py` auto-downloads models from HuggingFace Hub if not found locally
- [x] Frontend `.env.production` template ready

---

## 📋 YOUR Manual Steps (Do These In Order)

### Step 1️⃣ — Upload Models to HuggingFace Hub

1. Go to [https://huggingface.co](https://huggingface.co) → Sign up / Log in
2. Click **"New"** → **"Model"** → Name it `shieldsight/models` (or any name you like)
3. Set visibility to **Public** (free) or **Private** (also free)
4. Upload these files from `backend/models/`:
   - `production_xgboost_compatible.pkl`
   - `feature_names_compatible.pkl`
   - `production_xgboost_enhanced.pkl`
   - `feature_names_phiusiil.pkl`
   - `production_xgboost_fixed.pkl`
   - `feature_names_fixed.pkl`
5. Note your repo ID (e.g. `YourUsername/shieldsight-models`)

> **Why?** Keeps `.pkl` files out of Git, faster deploys, looks professional.

---

### Step 2️⃣ — Deploy Backend on Render

1. Go to [https://render.com](https://render.com) → Sign in with **GitHub**
2. Click **"New +"** → **"Web Service"**
3. Connect your **ShieldSight** repo
4. Configure:
   | Setting | Value |
   |---|---|
   | **Name** | `shieldsight-api` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `python -m pip install --upgrade pip setuptools wheel && pip install -r requirements.txt` |
   | **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
   | **Plan** | `Free` |
5. Add **Environment Variables** in Render dashboard:
   | Key | Value |
   |---|---|
   | `PORT` | `10000` |
   | `LOG_LEVEL` | `INFO` |
   | **PYTHON_VERSION** | `3.11.7` |
   | **HF_REPO_ID** | `YourUsername/shieldsight-models` ← from Step 1 |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | `shieldsight.off@gmail.com` |
   | `SMTP_PASSWORD` | *(your app password)* |
6. Click **"Create Web Service"** → Wait for build (~3-5 min)
7. You'll get a URL like: `https://shieldsight-api.onrender.com`
8. Test: Visit `https://shieldsight-api.onrender.com/health`

---

### Step 3️⃣ — Deploy Frontend on Vercel

1. Go to [https://vercel.com](https://vercel.com) → Sign in with **GitHub**
2. Click **"Add New..."** → **"Project"**
3. Import your **ShieldSight** repo
4. Configure:
   | Setting | Value |
   |---|---|
   | **Root Directory** | `frontend` |
   | **Framework Preset** | `Vite` |
5. Add **Environment Variable**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://shieldsight-api.onrender.com` ← from Step 2 |
6. Click **Deploy**

---

### Step 4️⃣ — (Optional) Prevent Backend Sleep

Render free tier sleeps after 15 min of inactivity (first request takes ~20s to wake up).

**Fix it for free:**
1. Go to [https://cron-job.org](https://cron-job.org) → Sign up (free)
2. Create a new cron job:
   - **URL**: `https://shieldsight-api.onrender.com/health`
   - **Schedule**: every 10 minutes
   - **Method**: GET
3. Save → Backend never sleeps ✅

---

## 🔍 Verification Checklist

After deployment, verify these in order:
- [ ] Backend health: `https://<your-render-url>/health` → `{"status": "healthy"}`
- [ ] API docs: `https://<your-render-url>/docs` loads Swagger UI
- [ ] Frontend loads: `https://<your-vercel-url>` shows ShieldSight
- [ ] URL scan works: Try scanning a URL end-to-end
- [ ] (Optional) Submit `sitemap.xml` to Google Search Console

---

## 🗑️ Cleanup (After Everything Works)

Delete these files once you're live:
- [ ] `REMAINING_TASKS.md` (this file)
- [ ] `DEPLOYMENT_GUIDE.md`
- [ ] `railway.json` (old Railway config)
- [ ] `nixpacks.toml` (Railway-specific)
