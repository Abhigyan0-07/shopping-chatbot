# Port Configuration Guide

## Files That Handle Port Configuration

### ✅ Already Fixed - No Changes Needed

The CORS configuration has been updated to **automatically accept ANY localhost port**, so you don't need to change anything if Vite uses a different port (5173, 5174, 5175, etc.).

---

## Files Modified for Port Flexibility

### 1. Backend CORS Configuration
**File:** `backend/server.js`
**Location:** Lines 28-60
**Status:** ✅ Fixed - Now accepts any localhost port automatically

```javascript
// CORS configuration - allow all localhost ports
app.use(cors({
  origin: (origin, callback) => {
    // Automatically allows http://localhost:ANY_PORT
    // No need to manually add new ports!
  }
}));
```

**What it does:** Automatically accepts connections from:
- `http://localhost:5173`
- `http://localhost:5174`
- `http://localhost:5175`
- `http://localhost:5176`
- Any other localhost port

---

### 2. Frontend Vite Configuration
**File:** `frontend/vite.config.js`
**Status:** ✅ Fixed - Allows port flexibility

```javascript
export default {
  server: {
    port: 5173,
    strictPort: false  // Allows Vite to use next available port
  }
};
```

**What it does:** If port 5173 is busy, Vite automatically uses 5174, 5175, etc.

---

### 3. Frontend API Endpoints
**File:** `frontend/chat.js`
**Location:** Lines 4-5
**Status:** ✅ No changes needed - Uses backend port (8000)

```javascript
const CHAT_ENDPOINT = "http://localhost:8000/api/chat";
const ORDERS_ENDPOINT = "http://localhost:8000/api/orders";
```

**Note:** These point to the backend (port 8000), not the frontend, so they don't need to change.

---

## Summary: What You Need to Know

### ✅ You DON'T Need to Change Anything

The configuration is now **dynamic** and will work with any port Vite chooses:
- Port 5173 ✅
- Port 5174 ✅
- Port 5175 ✅
- Any other port ✅

### 🔧 If You Want to Force a Specific Port

**Frontend (Vite):**
Edit `frontend/vite.config.js`:
```javascript
export default {
  server: {
    port: 5173,        // Change this to your desired port
    strictPort: true   // Set to true to fail if port is busy
  }
};
```

**Backend:**
Edit `backend/.env`:
```env
PORT=8000              # Backend port (usually stays 8000)
CLIENT_URL=http://localhost:5173  # This is just for logging, CORS is now dynamic
```

---

## Quick Reference

| Component | Port | File to Change | Need to Change? |
|-----------|------|----------------|-----------------|
| Backend | 8000 | `backend/.env` | Only if you want different port |
| Frontend | 5173+ | `frontend/vite.config.js` | Only if you want specific port |
| CORS | Dynamic | `backend/server.js` | ✅ Already fixed - no changes needed |

---

## Troubleshooting

**If you still get CORS errors:**

1. **Check backend is running:**
   ```bash
   netstat -ano | findstr :8000
   ```

2. **Check frontend port:**
   - Look at the terminal where you ran `npm run dev`
   - It will show: `Local: http://localhost:XXXX`

3. **Restart backend after any changes:**
   ```bash
   cd backend
   npm start
   ```

4. **Clear browser cache:**
   - Hard refresh: `Ctrl + Shift + R`

---

## Current Configuration Status

✅ **CORS:** Accepts any localhost port automatically
✅ **Vite:** Can use any available port (5173+)
✅ **Backend:** Fixed on port 8000
✅ **No manual port changes needed!**

---

**You're all set! The system will automatically handle any port Vite chooses.** 🎉

