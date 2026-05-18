# NeuroCare — Deployment Bug Fixes & Instructions

## Bugs Fixed

### 1. ❌ Login Failed (Critical)
**Root Cause:** `routes/auth.js` login route used `user.id` but the DB primary key is `user_id`.
- Token was signed with `undefined` → JWT was invalid → frontend got bad token → login failed.
- `UPDATE users SET last_login ... WHERE id = ?` also used wrong column.

**Fix:** Changed all `user.id` references to `user.user_id` in auth routes.

---

### 2. ❌ Registration Incomplete
**Root Cause:** The `register-complete` route called `db.query(profileSql, [...])` with NO callback.
- The response (`res.status(201).json(...)`) was sent *before* the profile insert finished.
- On Railway, this caused the response to sometimes be empty or crash.

**Fix:** Moved token generation and response inside the profile insert callback.

---

### 3. ❌ authController.js — ES Module syntax in CommonJS project
**Root Cause:** `authController.js` used `import`/`export` (ES Modules) but the backend uses `require()` (CommonJS). This causes a crash on startup.

**Fix:** Rewrote authController using `require()` / `module.exports`.

---

### 4. ❌ CORS Error with credentials
**Root Cause:** `server.js` set `origin: "*"` (wildcard) with `credentials: true`. This is invalid — browsers block it. Caused login/register requests to fail with CORS errors.

**Fix:** Changed to an explicit allowed origins list including your Vercel URL and localhost.

---

### 5. ❌ AI Chatbot: "AI backend not running on port 8000"
**Root Cause:** The Python FastAPI AI runs locally on `localhost:8000`. After deploying to Vercel, it can't reach `localhost` — the server doesn't exist in production.

**Fix (Option A — Recommended):** Route chat through the Node.js backend (`/api/chat`) which has keyword-based fallback responses. Works immediately with no extra deployment.

**Fix (Option B — Full AI):** Deploy the Python `mental_health_ai/app.py` on Railway or Render as a separate service, then set `REACT_APP_AI_URL=https://your-ai-service.onrender.com` in Vercel environment variables.

---

### 6. ❌ Therapist Details Not Showing
**Root Cause:** CORS was blocking the `/api/therapist` fetch (same CORS issue as #4). Also `Therapists.jsx` was using a hardcoded URL that differed from the backend URL.

**Fix:** CORS fix above resolves this. `Therapists.jsx` already uses `process.env.REACT_APP_BACKEND_URL` correctly.

---

### 7. ❌ db.js — mysql2 connection string
**Root Cause:** `mysql.createPool(process.env.DATABASE_URL)` passes the string as the first argument which is unreliable across mysql2 versions.

**Fix:** Changed to `mysql.createPool({ uri: process.env.DATABASE_URL, ... })`.

---

## Vercel Environment Variables (Frontend)
Go to Vercel → Your Project → Settings → Environment Variables and add:

```
REACT_APP_BACKEND_URL = https://neurocare-backend-3k89.onrender.com
REACT_APP_AI_URL      = (leave empty unless Python AI is deployed)
```

## Railway Environment Variables (Backend)
Add in Railway → Your Service → Variables:

```
PORT          = 8080
DATABASE_URL  = mysql://root:PASSWORD@mysql-xxxx.railway.internal:3306/railway
JWT_SECRET    = some_strong_secret_key_here
FRONTEND_URL  = https://your-vercel-app.vercel.app
```

⚠️ **IMPORTANT:** Update `FRONTEND_URL` to your exact Vercel deployment URL.
