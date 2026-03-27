/**
 * Layout Service: Handles saving and restoring Golden Layout configurations
 */

const STORAGE_KEY = 'dashboard_layout';
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
            componentState: {},
            title: 'Chart Panel',
          },
          {
            type: 'component',
            componentType: 'table',
            componentState: {},
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
            componentState: {},
            title: 'Activity Logs',
          },
        ],
      },
    ],
  },
};

export const saveLayout = (layoutConfig) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layoutConfig));
    console.log('Layout saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving layout:', error);
    return false;
  }
};

export const loadLayout = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  } catch (error) {
    console.error('Error loading layout:', error);
    return DEFAULT_LAYOUT;
  }
};

export const resetLayout = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Layout reset to default');
    return DEFAULT_LAYOUT;
  } catch (error) {
    console.error('Error resetting layout:', error);
    return DEFAULT_LAYOUT;
  }
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
    console.error('Error exporting layout:', error);
    return false;
  }
};

export const importLayout = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const layout = JSON.parse(e.target.result);
        saveLayout(layout);
        resolve(layout);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    } catch (error) {
      reject(error);
    }
  });
};
