# Quick Start Guide

## 🚀 30-Second Setup (Mac/Linux)

```bash
cd analytics-dashboard
bash setup.sh
bash start-dev.sh
```

Visit: **http://localhost:5173**

## 🚀 30-Second Setup (Windows)

```cmd
cd analytics-dashboard
setup.bat
start-dev.bat
```

Visit: **http://localhost:5173**

---

## 📋 Manual Setup (If Scripts Don't Work)

### Terminal 1: Start Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend will run on: **http://localhost:8000**

### Terminal 2: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## 🎯 What You Can Do

### Add Panels
- Click **📊 Chart** to add a revenue chart
- Click **📋 Data Table** to add product data
- Click **📝 Activity Logs** to add system logs

### Manage Layout
- **Drag**: Move panels by their header
- **Resize**: Drag borders between panels
- **Close**: Click X to remove panels
- **Tab**: Drop panels on each other to create tabs
- **💾 Auto-saves to browser storage**

### Reset
- Click **🔄 Reset Layout** to restore defaults

---

## 🔗 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/data/chart` | GET | Chart data (Revenue vs Expenses) |
| `/data/table` | GET | Product performance table |
| `/logs` | GET | Activity logs |
| `/health` | GET | Backend health check |

---

## 📂 Project Structure

```
analytics-dashboard/
├── frontend/          # React + Golden Layout
│   ├── src/
│   │   ├── components/     # Dashboard, Panels
│   │   ├── services/       # API, Layout management
│   │   ├── utils/          # Panel registry
│   │   └── styles/         # CSS
│   └── package.json
├── backend/           # FastAPI
│   ├── main.py         # API & mock data
│   └── requirements.txt
└── README.md          # Full documentation
```

---

## 🆘 Troubleshooting

### "Cannot find module 'golden-layout'"
```bash
cd frontend
npm install
```

### Backend connection refused
- Ensure backend is running: `python main.py` in `backend/` folder
- Check it's accessible: **http://localhost:8000**
- Check CORS is enabled in backend

### Layout not saving
- Confirm localStorage is enabled in browser
- Check browser console for errors (F12)
- Try clearing localStorage: `localStorage.clear()` in console

### Port already in use
- Backend: `python main.py --port 8001`
- Frontend: Update `API_BASE_URL` in `frontend/src/services/api.js`

---

## 📚 Learn More

- See **README.md** for detailed documentation
- See **ARCHITECTURE.md** for technical deep-dive
- Explore code in `frontend/src/components/` to understand panels
- Explore `backend/main.py` to understand API

---

## 🎓 Customization Examples

### Add a new panel type
1. Create `frontend/src/components/panels/MyPanel.jsx`
2. Add API endpoint to `backend/main.py`
3. Register in `frontend/src/utils/panelRegistry.js`
4. Panel appears in add menu automatically!

See **ARCHITECTURE.md** for detailed instructions.

---

## ✨ Features

- ✅ Drag & drop layout
- ✅ Resize panels
- ✅ Create tabs
- ✅ Add/remove panels dynamically
- ✅ Save layout to localStorage
- ✅ Multiple data visualizations
- ✅ Modular component system
- ✅ Mock backend data
- ✅ CORS enabled
- ✅ Responsive design

---

Happy building! 🎉
