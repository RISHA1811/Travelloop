# 🚀 Traveloop Setup Guide

## Quick Start (5 minutes)

### Step 1: Install Backend Dependencies

```bash
cd d:/Travel_Hackthon/traveloop/backend
npm install
```

**Expected output:** All dependencies installed successfully

### Step 2: Start Backend Server

```bash
npm run dev
```

**Expected output:**
```
Traveloop backend running on port 5000
```

✅ Backend is now running on `http://localhost:5000`

---

### Step 3: Install Frontend Dependencies

Open a **new terminal** window:

```bash
cd d:/Travel_Hackthon/traveloop/frontend
npm install
```

**Expected output:** All dependencies installed successfully

### Step 4: Start Frontend Server

```bash
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

✅ Frontend is now running on `http://localhost:5173`

---

### Step 5: Open in Browser

Open your browser and go to:
```
http://localhost:5173
```

You should see the **Traveloop Login Page** 🎉

---

## First Time Setup

### Create Your Admin Account

1. Click **"Sign up"** on the login page
2. Fill in:
   - **Name:** Your name
   - **Email:** Your email
   - **Password:** Your password
3. Click **"Create Account"**

🎉 **You are now an admin!** (First user automatically becomes admin)

---

## Testing the App

### 1. Create Your First Trip

1. Click **"+ New Trip"** or **"+ Create Trip"**
2. Select an emoji icon
3. Enter trip details:
   - Name: "Europe Summer 2025"
   - Start Date: Pick a future date
   - End Date: Pick an end date
   - Description: "Backpacking through Europe"
4. Click **"Create Trip"**

✅ You'll be taken to the trip detail page

### 2. Build an Itinerary

1. Click the **"Itinerary"** tab
2. Click **"✏️ Builder"**
3. Add a city:
   - City: "Paris"
   - Date: Pick a date
   - Click **"Add City"**
4. Expand the city (click ▼)
5. Add an activity:
   - Name: "Visit Eiffel Tower"
   - Time: "10:00"
   - Type: "Sightseeing"
   - Cost: "25"
   - Click **"Add Activity"**

✅ Your itinerary is building!

### 3. Add Budget Items

1. Go back to trip detail
2. Click **"Budget"** tab
3. Click **"Full View →"**
4. Add expenses:
   - Item: "Flight tickets"
   - Cost: "500"
   - Category: "Transport"
   - Click **"Add"**

✅ Budget is tracking!

### 4. Create Packing List

1. Go back to trip detail
2. Click **"Packing"** tab
3. Click **"Full View →"**
4. Click **"📋 Templates"**
5. Click **"🎒 Essentials"**

✅ Packing list auto-populated!

### 5. Write a Journal Entry

1. Click **"Journal"** in sidebar
2. Fill in:
   - Title: "Planning my dream trip"
   - Content: "So excited to visit Europe!"
   - Mood: Click 🤩
3. Click **"Add Entry"**

✅ Journal entry saved!

### 6. Share Your Trip

1. Go back to trip detail
2. Click **"🔗 Share"** button
3. Link copied to clipboard!
4. Open an **incognito window**
5. Paste the link

✅ Public share page works!

### 7. Test Admin Dashboard

1. Click **"🛡️ Admin"** in sidebar
2. View platform stats
3. Click **"Users"** tab
4. See your user listed

✅ Admin dashboard working!

---

## Troubleshooting

### Backend won't start

**Error:** `Port 5000 is already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

### Frontend won't start

**Error:** `Port 5173 is already in use`

**Solution:**
```bash
# Kill the process or it will auto-assign a new port
```

### "Cannot find module" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API calls failing

**Check:**
1. Backend is running on port 5000
2. Frontend proxy is configured in `vite.config.js`
3. No CORS errors in browser console

### Login not working

**Check:**
1. `backend/data/users.json` exists
2. Backend console for errors
3. Browser console for errors

---

## File Locations

### Backend
- **Server:** `backend/server.js`
- **Data:** `backend/data/users.json` and `backend/data/trips.json`
- **Config:** `backend/.env`

### Frontend
- **Entry:** `frontend/src/main.jsx`
- **Routes:** `frontend/src/App.jsx`
- **Config:** `frontend/vite.config.js`

---

## Default Ports

- **Backend:** `http://localhost:5000`
- **Frontend:** `http://localhost:5173`
- **API Base:** `/api` (proxied to backend)

---

## Environment Variables

### Backend (`.env`)
```
PORT=5000
JWT_SECRET=traveloop_super_secret_key_2024
```

### Frontend
No environment variables needed (uses Vite proxy)

---

## Data Storage

All data is stored in JSON files:

- **Users:** `backend/data/users.json`
- **Trips:** `backend/data/trips.json`

**Backup:** Just copy these files!

---

## Production Build

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

---

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Auth:** JWT + bcryptjs
- **Storage:** JSON files (no database)

---

## Support

If you encounter any issues:

1. Check both terminal windows for errors
2. Check browser console (F12)
3. Verify all dependencies installed
4. Restart both servers
5. Clear browser cache

---

## 🎉 You're All Set!

Enjoy using Traveloop! ✈️

**Next Steps:**
- Create multiple trips
- Test all features
- Share trips with friends
- Explore the admin dashboard
- Write journal entries
- Build detailed itineraries

Happy travels! 🌍
