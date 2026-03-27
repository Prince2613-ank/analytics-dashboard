# Architecture & Implementation Guide

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │  React App (http://localhost:5173)               │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  Dashboard Component (Golden Layout)        │ │  │
│  │  │  ┌──────────┬──────────┬──────────┐        │ │  │
│  │  │  │ Chart    │ Table    │ Logs     │        │ │  │
│  │  │  │ Panel    │ Panel    │ Panel    │        │ │  │
│  │  │  └──────────┴──────────┴──────────┘        │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────┬─────────────────────────────────┘
                       │ HTTP Requests
                       ▼
┌─────────────────────────────────────────────────────────┐
│  FastAPI Backend (http://localhost:8000)                │
│  ├─ /data/chart    → Chart data                        │
│  ├─ /data/table    → Table data                        │
│  ├─ /logs          → Activity logs                     │
│  └─ /health        → Health check                      │
└─────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App.jsx
└── Dashboard.jsx (Golden Layout container)
    ├── ChartPanel.jsx (Recharts LineChart)
    ├── TablePanel.jsx (HTML Table)
    └── LogsPanel.jsx (Log Display)
```

### Key Services

#### `panelRegistry.js`
Maps panel types to React components and metadata:
```javascript
PANEL_REGISTRY = {
  chart: { component: ChartPanel, title: 'Chart', icon: '📊' },
  table: { component: TablePanel, title: 'Data Table', icon: '📋' },
  logs: { component: LogsPanel, title: 'Activity Logs', icon: '📝' }
}
```

**Why**: Allows dynamic panel creation and extensibility without modifying Dashboard component.

#### `layoutService.js`
Handles persistence of dashboard layouts:
- `saveLayout()` → localStorage
- `loadLayout()` → retrieve from storage
- `resetLayout()` → restore defaults
- `exportLayout()` → JSON export
- `importLayout()` → JSON import

**Why**: Users can customize their workspace and have it persist across sessions.

#### `api.js`
Centralized API client using axios:
```javascript
getChartData()   // GET /data/chart
getTableData()   // GET /data/table
getLogs()        // GET /logs
healthCheck()    // GET /health
```

**Why**: Centralized error handling and baseURL configuration.

### Golden Layout Integration

Golden Layout provides the desktop-like experience. Integration happens in Dashboard.jsx:

1. **Component Registration**
   ```javascript
   glLayout.registerComponent(panelType, (container, componentState) => {
     // Create React component and mount to container
   })
   ```

2. **State Synchronization**
   ```javascript
   glLayout.on('stateChanged', () => {
     const state = glLayout.toConfig()
     saveLayout(state)  // Auto-save on changes
   })
   ```

3. **React-Golden Layout Bridge**
   - Golden Layout creates DOM containers
   - We use React.createElement() + ReactDOM.createRoot() to mount React components
   - Proper cleanup on container destroy

### Data Flow

```
User adds panel
        ↓
handleAddPanel() called
        ↓
glLayout.root.contentItems.addChild()
        ↓
Panel component created
        ↓
Component mounts → useEffect()
        ↓
API call (getChartData, etc.)
        ↓
Backend responds
        ↓
Component updates with data
        ↓
Golden Layout re-renders container
        ↓
Layout state changed
        ↓
saveLayout() → localStorage
```

## Backend Architecture

### FastAPI Application Structure

```
main.py
├── CORS Configuration
├── Route Handlers
│   ├── GET / (root)
│   ├── GET /data/chart
│   ├── GET /data/table
│   ├── GET /logs?limit={limit}
│   └── GET /health
└── Mock Data Functions
    └── generate_logs(count)
```

### API Response Formats

**Chart Data** (`/data/chart`)
```json
{
  "labels": ["Jan", "Feb", "Mar"],
  "datasets": [
    {
      "label": "Revenue",
      "data": [12000, 15000, 10000],
      "borderColor": "rgb(75, 192, 192)",
      "backgroundColor": "rgba(75, 192, 192, 0.1)"
    }
  ]
}
```

**Table Data** (`/data/table`)
```json
{
  "columns": ["id", "name", "sales", "revenue", "margin"],
  "rows": [
    {"id": 1, "name": "Product A", "sales": 12500, "revenue": 125000, "margin": "35%"}
  ]
}
```

**Logs** (`/logs?limit=20`)
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

### CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow frontend on different port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Why**: Frontend (5173) and Backend (8000) run on different ports during development.

## State Management Flow

### Layout Persistence

```
Initial Load
    ↓
loadLayout() from localStorage
    ↓
No layout found? Use DEFAULT_LAYOUT
    ↓
Initialize Golden Layout with config
    ↓
glLayout.on('stateChanged') listener
    ↓
User arranges panels
    ↓
'stateChanged' event fires
    ↓
saveLayout(glLayout.toConfig())
    ↓
JSON saved to localStorage
    ↓
Next session? loadLayout() retrieves it
```

### Panel Data Loading

```
Panel Component Mounts
    ↓
useEffect() runs
    ↓
Call API service (e.g., getChartData())
    ↓
Set loading = true
    ↓
Backend responds
    ↓
Transform data if needed (Recharts format)
    ↓
setData(transformedData)
    ↓
Component re-renders with data
    ↓
Set loading = false
```

## Styling Architecture

### Style Layers

1. **Global** (`styles/app.css`)
   - Base reset, html/body/root sizing

2. **Dashboard** (`components/styles/dashboard.css`)
   - Header, controls, layout container
   - Responsive design

3. **Panels** (`components/styles/panels.css`)
   - Panel content styling
   - Table and logs specific styles

4. **Golden Layout Overrides** (`components/styles/golden-layout-override.css`)
   - Header, tabs, splitters
   - Drag/drop visual feedback

### Design System

- **Primary Color**: #667eea (Purple)
- **Accent**: #764ba2 (Deep purple)
- **Neutral**: #f9fafb to #1f2937 (Gray scale)
- **Semantic**: Green (success), Red (error), Yellow (warning), Blue (info)

## Error Handling

### Frontend

1. **API Errors**
   - Try-catch in service methods
   - Component shows error state
   - User sees "Failed to load..." message

2. **Layout Errors**
   - Graceful fallback to DEFAULT_LAYOUT
   - localStorage errors handled

### Backend

1. **CORS Errors**
   - Middleware handles across domains
   - All origins allowed (adjust for production)

2. **Data Errors**
   - Mock data hardcoded (no crashes)
   - Random log generation in generate_logs()

## Adding New Features

### Add a New Panel Type

1. **Create Component** in `frontend/src/components/panels/NewPanel.jsx`:
```jsx
const NewPanel = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    // Fetch data
    setData(...)
  }, [])
  return <div className="panel-content">...</div>
}
```

2. **Create API Endpoint** in `backend/main.py`:
```python
@app.get("/data/newpanel")
def get_new_panel_data():
    return { "data": [...] }
```

3. **Add Service Method** in `frontend/src/services/api.js`:
```javascript
export const getNewPanelData = async () => {
  const response = await api.get('/data/newpanel')
  return response.data
}
```

4. **Register Panel** in `frontend/src/utils/panelRegistry.js`:
```javascript
import NewPanel from '../components/panels/NewPanel'
export const PANEL_REGISTRY = {
  ...existing,
  newpanel: {
    component: NewPanel,
    title: 'New Panel',
    icon: '🆕'
  }
}
```

Panel automatically appears in add menu!

## Performance Considerations

1. **Golden Layout**: Efficiently manages DOM updates
2. **Recharts**: Only re-renders when data changes
3. **localStorage**: Synchronous but fast for small configs
4. **API Calls**: Axios caching can be added
5. **Component Cleanup**: useEffect cleanup prevents memory leaks

## Testing Checklist

- [ ] Dashboard loads without errors
- [ ] Can add/remove panels
- [ ] Panels display correct data
- [ ] Drag and drop works
- [ ] Resize works
- [ ] Tabs can be created
- [ ] Layout persists after refresh
- [ ] Reset layout works
- [ ] Backend responds to all endpoints
- [ ] CORS headers are correct

## Deployment Notes

1. **Frontend Build**: `npm run build` → optimized dist/
2. **Backend**: Deploy FastAPI with uvicorn
3. **Environment**: Update API_BASE_URL for production
4. **Storage**: Consider server-side layout storage for multi-device sync
5. **Monitoring**: Add error tracking (Sentry, etc.)
