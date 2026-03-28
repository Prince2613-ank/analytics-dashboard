# Analytics Dashboard - Full Stack Project

A customizable, drag-and-drop analytics dashboard built with **React + Golden Layout** frontend and **FastAPI** backend.

## 🎯 Features

- **Dynamic Dashboard Layout** using Golden Layout
  - Drag and drop panels
  - Resize panels
  - Dock panels
  - Tabbed views

- **Multiple Panel Types**
  - 📊 Chart Panel - Revenue vs Expenses visualization
  - 📋 Data Table Panel - Product performance metrics
  - 📝 Activity Logs Panel - Real-time system logs

- **Layout Management**
  - Save layout to localStorage
  - Restore previous layouts
  - Reset to default layout
  - Add/remove panels dynamically

- **Backend APIs**
  - `/data/chart` - Chart data endpoint
  - `/data/table` - Table data endpoint
  - `/logs` - Activity logs endpoint
  - `/health` - Health check endpoint

## 📋 Project Structure

```
analytics-dashboard/
├── frontend/                    # React + Golden Layout
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx    # Main dashboard component
│   │   │   ├── panels/
│   │   │   │   ├── ChartPanel.jsx
│   │   │   │   ├── TablePanel.jsx
│   │   │   │   └── LogsPanel.jsx
│   │   │   └── styles/
│   │   ├── services/
│   │   │   ├── api.js           # Backend API calls
│   │   │   └── layoutService.js # Save/restore layouts
│   │   ├── utils/
│   │   │   └── panelRegistry.js # Panel type registry
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # FastAPI
│   ├── main.py                  # FastAPI app
│   └── requirements.txt
│
└── README.md
```

## 🚀 Quick Start

### Backend Setup

1. **Install dependencies**
```bash
cd backend
pip install -r requirements.txt
```

2. **Run the server**
```bash
python main.py
```

The backend will start on `http://localhost:8000`

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Run development server**
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

3. **Visit the dashboard**
Open `http://localhost:5173` in your browser

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Golden Layout 2** - Premium desktop layout manager
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **FastAPI** - Modern async web framework
- **Uvicorn** - ASGI server
- **Python 3.8+**

## 📖 How to Use

### Adding Panels
Click the panel buttons in the header to dynamically add new panels:
- 📊 Chart - Add a chart panel
- 📋 Data Table - Add a data table panel
- 📝 Activity Logs - Add a logs panel

### Managing Layouts
- **Drag**: Click and drag panel headers to rearrange
- **Resize**: Drag the borders between panels to resize
- **Tab**: Drop panels on each other to create tabs
- **Close**: Use the X button to remove panels

### Saving Layouts
Your layout is automatically saved to browser localStorage whenever you make changes. The layout persists across browser sessions.

### Resetting Layout
Click **🔄 Reset Layout** button to restore the default layout.

## 🔌 API Endpoints

### `/data/chart` (GET)
Returns chart data in the format:
```json
{
  "labels": ["Jan", "Feb", "Mar", ...],
  "datasets": [
    {
      "label": "Revenue",
      "data": [12000, 15000, 10000, ...],
      "borderColor": "rgb(75, 192, 192)",
      "backgroundColor": "rgba(75, 192, 192, 0.1)"
    }
  ]
}
```

### `/data/table` (GET)
Returns table data:
```json
{
  "columns": ["id", "name", "sales", "revenue", "margin"],
  "rows": [
    {"id": 1, "name": "Product A", "sales": 12500, ...}
  ]
}
```

### `/logs` (GET)
Returns activity logs. Query parameter: `limit` (default: 20)
```json
{
  "logs": [
    {
      "id": 1,
      "timestamp": "2024-01-15T10:30:00",
      "type": "INFO",
      "message": "User dashboard accessed"
    }
  ]
}
```

### `/health` (GET)
Health check endpoint:
```json
{"status": "healthy"}
```

## 🎨 Customization

### Adding New Panel Types

1. **Create panel component** in `frontend/src/components/panels/`:
```jsx
// NewPanel.jsx
import React, { useEffect, useState } from 'react';
import '../styles/panels.css';

const NewPanel = () => {
  return (
    <div className="panel-content">
      <h3>My New Panel</h3>
      {/* Your content */}
    </div>
  );
};

export default NewPanel;
```

2. **Register in panel registry** (`frontend/src/utils/panelRegistry.js`):
```js
import NewPanel from '../components/panels/NewPanel';

export const PANEL_REGISTRY = {
  // ... existing panels
  newpanel: {
    component: NewPanel,
    title: 'New Panel',
    icon: '🆕',
  },
};
```

### Styling
- Panel styles: `frontend/src/components/styles/panels.css`
- Dashboard styles: `frontend/src/components/styles/dashboard.css`
- Golden Layout theme: `frontend/src/components/styles/golden-layout-override.css`

## 🧪 Backend Development

### Mock Data
The backend uses in-memory mock data. To use real MongoDB:

1. Install MongoDB driver:
```bash
pip install pymongo
```

2. Update `backend/main.py` to connect to MongoDB

## 📦 Build for Production

### Frontend
```bash
cd frontend
npm run build
```

Creates optimized build in `frontend/dist/`

### Backend
```bash
cd backend
python main.py
```

## 🐛 Troubleshooting

**Golden Layout not rendering**
- Ensure `golden-layout` CSS is imported
- Check browser console for errors
- Verify React component is properly mounted

**Backend connection errors**
- Ensure backend is running on `http://localhost:8000`
- Check CORS settings in `backend/main.py`
- Verify API endpoints in `frontend/src/services/api.js`

**Layout not persisting**
- Check browser localStorage is enabled
- Verify `layoutService.js` is working
- Clear localStorage and reload: `localStorage.clear()`

## 📝 Development Notes

### Golden Layout Integration
- React components are dynamically created using `registerComponent`
- Each component is mounted to a DOM container provided by Golden Layout
- Layout state is automatically synced with localStorage

### State Management
- Layout configuration stored in localStorage
- Panel data fetched from backend APIs
- Component state managed with React hooks

## 📄 License

MIT

## 👨‍💻 Contributing

Feel free to fork and submit pull requests!

---

**Ready to build?** Start the backend and frontend, then customize the panels and APIs to your needs!

cd backend
..\.venv\Scripts\python.exe -m uvicorn main:app --port 8000 --reload

cd frontend
npm run dev
