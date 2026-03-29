# 📊 Customizable Analytics Dashboard

A full-stack, customizable analytics dashboard built with **React**, **Golden Layout**, and **FastAPI**. This application empowers users to organize multiple data visualization panels within a flexible, drag-and-drop workspace that mimics a desktop environment directly in the browser.

## ✨ Core Features
*   **Dynamic Layout Engine:** Powered by Golden Layout V2, enabling users to seamlessly drag, drop, resize, dock, and nest panels into tabbed views.
*   **Interactive Data Panels:**
    *   📈 **Chart Panel:** Visualizes analytical sales and revenue data dynamically using Recharts.
    *   📋 **Data Table Panel:** Displays comprehensive tabular data retrieved from the backend.
    *   📝 **Logs Panel:** Streams real-time system activity logs directly via WebSockets.
    *   🗺️ **Map Panel (Bonus):** Interactive geographic visualization powered by React-Leaflet.
*   **Persistent Customization:** Instantly saves workspace layouts to browser `localStorage` ensuring your unique layout configuration persists across sessions. 
*   **Dashboard Management:** Built-in controls to quickly reset to the default view or extract and `Export JSON` representations of your layout.
*   **Clean API Architecture:** A robust Python backend serving optimized data payloads via a structured FastAPI and MongoDB architecture.

## ⚙️ Tech Stack
*   **Frontend:** React 18, Golden Layout 2, Vite, Recharts, Leaflet
*   **Backend:** FastAPI, Python, Uvicorn, WebSockets
*   **Database:** MongoDB

---

## 🚀 Quick Start Guide

### 1. Start the Backend API
Navigate to the `backend` directory and run the server using the existing virtual environment.

```bash
cd backend
set .env
python -m venv .venv  
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --port 8000 --reload
```
> The API will launch at `http://localhost:8000`. Endpoint `/docs` available for Swagger UI.

### 2. Launch the Frontend UI
Navigate to the `frontend` directory, install Node packages, and run the Vite dev server.

```bash
cd frontend
npm install
npm run dev
```
> Open `http://localhost:5173` in your browser to interact with the dashboard.
