/**
 * Layout Service: Handles saving and restoring Golden Layout configurations
 */

const STORAGE_KEY = 'dashboard_layout_v3_clean';

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
  root: {
    type: 'row',
    content: [
      {
        type: 'column',
        width: 50,
        content: [
          {
            type: 'component',
            componentType: 'chart',
            title: 'Chart Panel',
          },
          {
            type: 'component',
            componentType: 'table',
            title: 'Data Table',
          },
        ],
      },
      {
        type: 'column',
        width: 50,
        content: [
          {
            type: 'component',
            componentType: 'logs',
            title: 'Activity Logs',
          },
        ],
      },
    ],
  },
};

export const saveLayout = (layoutConfig) => {
  try {
    if (!layoutConfig || !layoutConfig.root || !layoutConfig.root.content) {
      console.warn('⚠️ Invalid layout structure:', layoutConfig);
      return false;
    }

    // Save ONLY version and root - strip all other fields
    const cleanConfig = {
      version: 2,
      root: layoutConfig.root,
    };

    const jsonString = JSON.stringify(cleanConfig);
    localStorage.setItem(STORAGE_KEY, jsonString);
    console.log('✅ Layout saved:', { size: jsonString.length, panels: countPanels(cleanConfig.root) });
    return true;
  } catch (error) {
    console.error('❌ Save error:', error);
  }
  return false;
};

// Helper to count panels
const countPanels = (node) => {
  if (!node || !node.content) return 0;
  let count = 0;
  node.content.forEach((item) => {
    if (item.type === 'component') count++;
    else count += countPanels(item);
  });
  return count;
};

export const loadLayout = () => {
  try {
    // IMPORTANT: Always start with fresh default to avoid corruption issues
    // Only try to load saved layout if user explicitly imports one
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
