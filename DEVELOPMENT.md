# Development Guide

## Adding a New Panel Type

This guide shows how to create a completely new panel type.

### Step 1: Create the Panel Component

Create `frontend/src/components/panels/MetricsPanel.jsx`:

```jsx
import React, { useEffect, useState } from 'react';
import '../styles/panels.css';

const MetricsPanel = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        // Fetch from your new API endpoint
        const response = await fetch('http://localhost:8000/data/metrics');
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError('Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) return <div className="panel-content"><p>Loading metrics...</p></div>;
  if (error) return <div className="panel-content error"><p>{error}</p></div>;

  return (
    <div className="panel-content">
      <h3>Key Metrics</h3>
      {metrics && (
        <div>
          {/* Render your metrics */}
          <p>Value: {metrics.value}</p>
        </div>
      )}
    </div>
  );
};

export default MetricsPanel;
```

### Step 2: Create API Service Method

Add to `frontend/src/services/api.js`:

```javascript
export const getMetrics = async () => {
  try {
    const response = await api.get('/data/metrics');
    return response.data;
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
};
```

Or simply use fetch directly in your component.

### Step 3: Register Panel Type

Update `frontend/src/utils/panelRegistry.js`:

```javascript
import MetricsPanel from '../components/panels/MetricsPanel';

export const PANEL_REGISTRY = {
  chart: { ... },
  table: { ... },
  logs: { ... },
  metrics: {  // ← Add this
    component: MetricsPanel,
    title: 'Metrics',
    icon: '📈',
  },
};
```

### Step 4: Create Backend Endpoint

Add to `backend/main.py`:

```python
@app.get("/data/metrics")
def get_metrics():
    """Endpoint to fetch key metrics"""
    return {
        "value": 9876,
        "trend": "+12%",
        "status": "healthy"
    }
```

### Step 5: Done! 🎉

- The **📈 Metrics** button now appears in the header
- Click it to add a Metrics panel
- Panel is fully functional with drag/drop/resize

---

## Adding Styling to Panels

Add custom styles to `frontend/src/components/styles/panels.css`:

```css
.metrics-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px;
}

.metric-item {
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #667eea;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.metric-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}
```

Update your component to use these classes.

---

## Hooking Up Real Data

### From a Database

Instead of mock data, connect to a real database:

```python
# backend/main.py
from pymongo import MongoClient  # or SQLAlchemy for SQL

client = MongoClient('mongodb://localhost:27017')
db = client.dashboard_db

@app.get("/data/chart")
def get_chart_data():
    # Query real data from database
    data = db.chart_data.find_one()
    return data
```

### From an External API

```python
import requests

@app.get("/data/external")
def get_external_data():
    response = requests.get('https://api.example.com/data')
    return response.json()
```

---

## State Management

### Using Context API (for complex state)

Create `frontend/src/context/LayoutContext.jsx`:

```jsx
import React, { createContext, useState } from 'react';

export const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
  const [layout, setLayout] = useState(null);
  const [panels, setPanels] = useState([]);

  return (
    <LayoutContext.Provider value={{ layout, setLayout, panels, setPanels }}>
      {children}
    </LayoutContext.Provider>
  );
};
```

Use in your components:
```jsx
import { useContext } from 'react';
import { LayoutContext } from '../context/LayoutContext';

const MyComponent = () => {
  const { panels } = useContext(LayoutContext);
  return <div>{/* Use panels */}</div>;
};
```

### Using Redux (for larger apps)

Install Redux:
```bash
npm install redux react-redux
```

Create store, actions, reducers as needed.

---

## Error Handling Best Practices

### In Components

```jsx
const [error, setError] = useState(null);
const [retryCount, setRetryCount] = useState(0);

const handleRetry = () => {
  setRetryCount(retryCount + 1);
  fetchData();
};

if (error) {
  return (
    <div className="panel-content error">
      <p>{error}</p>
      <button onClick={handleRetry}>Retry ({retryCount})</button>
    </div>
  );
}
```

### In API Service

```javascript
export const getChartData = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await api.get('/data/chart');
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
    }
  }
};
```

---

## Performance Optimization

### Memoization

```jsx
import { memo } from 'react';

const ChartPanel = memo(({ data }) => {
  return <LineChart data={data} />;
}, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  return prevProps.data === nextProps.data;
});

export default ChartPanel;
```

### Code Splitting

```jsx
import { lazy, Suspense } from 'react';

const MetricsPanel = lazy(() => import('./panels/MetricsPanel'));

export default () => (
  <Suspense fallback={<div>Loading...</div>}>
    <MetricsPanel />
  </Suspense>
);
```

### Caching Requests

```javascript
const cache = new Map();

export const getCachedData = async (key, fetchFn) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = await fetchFn();
  cache.set(key, data);
  return data;
};
```

---

## Testing

### Component Tests (using Vitest)

Install:
```bash
npm install -D vitest @testing-library/react
```

Create `frontend/src/components/panels/__tests__/ChartPanel.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChartPanel from '../ChartPanel';

describe('ChartPanel', () => {
  it('displays loading state', () => {
    render(<ChartPanel />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

### API Tests (using pytest for backend)

Create `backend/test_main.py`:

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_chart_endpoint():
    response = client.get("/data/chart")
    assert response.status_code == 200
    assert "labels" in response.json()
```

Run tests:
```bash
pytest backend/test_main.py
```

---

## Deployment

### Building Frontend

```bash
cd frontend
npm run build
```

Creates optimized build in `frontend/dist/`

### Deploying Backend

Using Gunicorn (production ASGI server):

```bash
pip install gunicorn
gunicorn backend.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

### Environment Variables

Create `.env` file:
```
BACKEND_URL=http://localhost:8000
API_TIMEOUT=5000
DEBUG=false
```

Load in frontend:
```javascript
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
```

---

## Debugging Tips

### Browser DevTools
- F12 → Network tab: See API calls
- F12 → Console tab: See errors
- F12 → Storage → LocalStorage: Check saved layout

### Golden Layout Debugging
```javascript
glLayout.on('stateChanged', () => {
  console.log('Layout state:', glLayout.toConfig());
});
```

### Backend Debugging
```python
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
logger.debug("Debug message")
```

---

## Common Patterns

### Loading State Management
```jsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

useEffect(() => {
  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetch();
}, []);
```

### Polling Data
```jsx
useEffect(() => {
  const fetch = async () => setData(await fetchData());
  fetch();

  const interval = setInterval(fetch, 5000); // Every 5 seconds
  return () => clearInterval(interval);
}, []);
```

### Debouncing Requests
```jsx
useEffect(() => {
  const timer = setTimeout(() => {
    fetchData();
  }, 500);

  return () => clearTimeout(timer);
}, [searchTerm]); // Fetch after user stops typing
```

---

Need help? Check ARCHITECTURE.md for more details!
