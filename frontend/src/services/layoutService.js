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
      console.log(`🧹 Removed old key: ${key}`);
    } catch (e) {
      console.warn('Could not remove old key:', key);
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
        content: [
          {
            type: "component",
            componentType: "chart",
            title: "Chart"
          },
          {
            type: "component",
            componentType: "map",
            title: "Map"
          }
        ]
      },
      {
        type: "row",
        content: [
          {
            type: "component",
            componentType: "table",
            title: "Data Table"
          },
          {
            type: "component",
            componentType: "logs",
            title: "Activity Logs"
          }
        ]
      }
    ]
  }
};

// Recursively sanitizes layout nodes to ensure dimensions are strings, 
// as Golden Layout v2 expects strings during init but exports numbers.
const sanitizeLayoutNode = (node) => {
  if (!node) return;

  // Fields that Golden Layout's parser expects to be strings (e.g., "50%")
  const dimensionFields = ['width', 'height', 'size'];

  dimensionFields.forEach(field => {
    if (typeof node[field] === 'number') {
      // Convert to string with percentage unit for GL's internal parser
      node[field] = `${node[field]}%`;
    }
  });

  if (node.content && Array.isArray(node.content)) {
    node.content.forEach(sanitizeLayoutNode);
  }
};

// Validates that a config object is a valid Golden Layout v2 configuration
const isValidConfig = (config) => {
  return !!(config && config.version === 2 && config.root && config.root.type);
};

export const saveLayout = (layoutConfig) => {
  try {
    if (!layoutConfig || !layoutConfig.root || !layoutConfig.root.content) {
      console.warn('⚠️ Invalid layout structure:', layoutConfig);
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
    console.log('✅ Layout saved with preserved sizes');
    return true;
  } catch (error) {
    console.error('❌ Save error:', error);
  }
  return false;
};

export const loadLayout = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      console.log('📋 Attempting to restore layout from localStorage');
      const parsed = JSON.parse(saved);

      // Basic validation
      if (isValidConfig(parsed)) {
        // Sanitize on load as a safety measure for any legacy numeric data
        sanitizeLayoutNode(parsed.root);
        console.log('✅ Valid layout restored with preserved sizes');
        return parsed;
      } else {
        console.warn('⚠️ Stored layout was invalid or outdated, falling back to default');
      }
    }

    console.log('📋 Starting with fresh default layout');
    return JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
  } catch (e) {
    console.error('❌ Load error:', e);
    return JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
  }
};

export const resetLayout = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🔄 Layout cleared');
  } catch (error) {
    console.error('❌ Reset error:', error);
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
    console.log('📥 Exported');
    return true;
  } catch (error) {
    console.error('❌ Export error:', error);
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
          console.log('📤 Imported');
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
