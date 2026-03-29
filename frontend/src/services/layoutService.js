/**
 * Layout Service: Handles saving and restoring Golden Layout configurations
 */

const STORAGE_KEY = 'dashboard_layout_v4';

// Clean up old keys on init
const cleanupOldKeys = () => {
  const oldKeys = ['dashboard_layout', 'dashboard_layout_v2', 'dashboard_layout_v3'];
  oldKeys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Ignore cleanup errors
    }
  });
};

// Run cleanup on module load
cleanupOldKeys();

// Use this EXACT format that Golden Layout v2 expects
const DEFAULT_LAYOUT = {
  version: 2,
  settings: {
    showPopoutIcon: true,
    showMaximiseIcon: true,
    showCloseIcon: true,
  },
  root: {
    type: "column",
    content: [
      {
        type: "row",
        size: "50%",
        content: [
          {
            id: "chart-1",
            type: "component",
            componentType: "chart",
            title: "Chart",
            size: "50%",
            componentState: { panelId: "chart", lastUpdated: Date.now() }
          },
          {
            id: "map-1",
            type: "component",
            componentType: "map",
            title: "Map",
            size: "50%",
            componentState: { panelId: "map", lastUpdated: Date.now() }
          }
        ]
      },
      {
        type: "row",
        size: "50%",
        content: [
          {
            id: "table-1",
            type: "component",
            componentType: "table",
            title: "Data Table",
            size: "50%",
            componentState: { panelId: "table", lastUpdated: Date.now() }
          },
          {
            id: "logs-1",
            type: "component",
            componentType: "logs",
            title: "Activity Logs",
            size: "50%",
            componentState: { panelId: "logs", lastUpdated: Date.now() }
          }
        ]
      }
    ]
  }
};

// Recursively sanitizes layout nodes to ensure dimensions are strings, 
// as Golden Layout v2 expects strings during init but exports numbers.
// Recursively sanitizes layout nodes to ensure production standards (IDs, metadata, dimensions).
// This is a non-destructive upgrade that hydrates missing fields in existing layouts.
const sanitizeLayoutNode = (node, path = 'root') => {
  if (!node) return;

  // 1. Stabilization: Ensure dimensions are strings for Golden Layout v2
  const dimensionFields = ['width', 'height', 'size'];
  dimensionFields.forEach(field => {
    if (typeof node[field] === 'number') {
      node[field] = `${node[field]}%`;
    }
  });

  if (node.type === 'component') {
    // 2. Production Hardening: Ensure unique and non-empty "id"
    if (!node.id || node.id === "") {
      // Fallback to a structured ID if missing
      node.id = `${node.componentType || 'panel'}-${path.split('-').pop() || Date.now()}`;
    }

    // 3. Metadata Hydration: Ensure componentState contains panelId and lastUpdated
    if (!node.componentState) {
      node.componentState = {};
    }
    
    // Only set panelId if it doesn't already exist to preserve custom state
    if (!node.componentState.panelId) {
      node.componentState.panelId = node.componentType;
    }
    
    // Always update lastUpdated during sanitization (saving/loading/exporting)
    node.componentState.lastUpdated = Date.now();
  }

  if (node.content && Array.isArray(node.content)) {
    node.content.forEach((child, index) => sanitizeLayoutNode(child, `${path}-${index}`));
  }
};

// Validates that a config object is a valid Golden Layout v2 configuration
const isValidConfig = (config) => {
  return !!(config && config.version === 2 && config.root && config.root.type);
};

export const saveLayout = (layoutConfig) => {
  try {
    if (!layoutConfig || !layoutConfig.root || !layoutConfig.root.content) {
      return false;
    }

    // Deep clone to avoid mutating the live layout instance state
    const cleanConfig = JSON.parse(JSON.stringify({
      version: 2,
      root: layoutConfig.root,
    }));

    // Sanitize numeric sizes to strings before saving to localStorage
    sanitizeLayoutNode(cleanConfig.root);

    const jsonString = JSON.stringify(cleanConfig);
    localStorage.setItem(STORAGE_KEY, jsonString);
    return true;
  } catch (error) {
    // Silence save errors
  }
  return false;
};

export const loadLayout = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);

      // Basic validation
      if (isValidConfig(parsed)) {
        // Sanitize on load as a safety measure for any legacy numeric data
        sanitizeLayoutNode(parsed.root);
        return parsed;
      }
    }


    return JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
  }
};

export const resetLayout = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Ignore reset errors
  }
  return JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
};

export const exportLayout = (layoutConfig) => {
  try {
    const dataStr = JSON.stringify(layoutConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-layout-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    return false;
  }
};

export const importLayout = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const layout = JSON.parse(e.target.result);
          saveLayout(layout);
          resolve(layout);
        } catch (e) {
          reject(new Error('Invalid file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read'));
      reader.readAsText(file);
    } catch (error) {
      reject(error);
    }
  });
};
