import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { GoldenLayout } from 'golden-layout';
import { getPanelComponent, PANEL_REGISTRY } from '../utils/panelRegistry';
import { loadLayout, saveLayout, resetLayout, exportLayout } from '../services/layoutService';
import { createLog } from '../services/api';
import './styles/dashboard.css';
import './styles/golden-layout-override.css';

// Helper to count panels in layout
const countPanels = (node) => {
  if (!node || !node.content) return 0;
  let count = 0;
  node.content.forEach((item) => {
    if (item.type === 'component') count++;
    else count += countPanels(item);
  });
  return count;
};

// Helper to get all active panel types from layout config
const getActivePanelTypes = (node) => {
  const types = new Set();
  if (!node) return types;
  
  if (node.type === 'component' && node.componentType) {
    types.add(node.componentType);
  }
  
  if (node.content && Array.isArray(node.content)) {
    node.content.forEach((item) => {
      getActivePanelTypes(item).forEach((type) => types.add(type));
    });
  }
  
  return types;
};

// Find an existing ComponentItem for a given panel type
const findComponentItem = (contentItem, type) => {
  if (!contentItem) return null;

  if (contentItem.isComponent && contentItem.config?.componentType === type) {
    return contentItem;
  }

  if (!contentItem.contentItems) return null;

  for (const child of contentItem.contentItems) {
    const found = findComponentItem(child, type);
    if (found) return found;
  }

  return null;
};

const Dashboard = () => {
  const containerRef = useRef(null);
  const layoutRef = useRef(null);
  const rootsRef = useRef(new Map());
  const isInitializedRef = useRef(false);
  const [activePanels, setActivePanels] = useState(new Set());
  const [toasts, setToasts] = useState([]);

  // Toast manager
  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Update active panels state from layout
  const updateActivePanels = (glLayout) => {
    try {
      const config = glLayout.toConfig();
      const types = getActivePanelTypes(config.root);
      setActivePanels(types);
    } catch (e) {
      console.warn('Error updating active panels:', e);
    }
  };

  useEffect(() => {
    let currentCleanup = null;
    
    const initLayout = () => {
      try {
        const container = containerRef.current;
        if (!container || isInitializedRef.current) return null;

        // Ensure container is ready for measuring
        if (container.clientWidth === 0 || container.clientHeight === 0) {
          console.log('⏳ Container dimensions not ready, retrying...');
          return null;
        }

        console.log('📐 Container dimensions:', {
          width: container.clientWidth,
          height: container.clientHeight,
        });

        // Load layout config
        const layoutConfig = loadLayout();
        console.log('📋 Loading layout with', countPanels(layoutConfig.root), 'panels');

        // Create Golden Layout instance
        const glLayout = new GoldenLayout(layoutConfig, container);

        // Register components BEFORE init
        Object.keys(PANEL_REGISTRY).forEach((type) => {
          glLayout.registerComponent(type, (container) => {
            const Component = getPanelComponent(type);
            const element = document.createElement('div');
            element.style.width = '100%';
            element.style.height = '100%';
            element.className = 'panel-wrapper';

            // Append to container element
            container.element.appendChild(element);

            // Create React root
            const reactRoot = ReactDOM.createRoot(element);
            reactRoot.render(React.createElement(Component));

            // Store for cleanup
            const id = Math.random().toString();
            rootsRef.current.set(id, { root: reactRoot, element });

            // Cleanup on destroy
            container.on('destroy', () => {
              try {
                // Log panel removal
                createLog('INFO', 'panel_removed', `Panel "${type}" removed from dashboard`);
                
                const stored = rootsRef.current.get(id);
                if (stored) {
                  stored.root.unmount();
                  rootsRef.current.delete(id);
                }
              } catch (e) {
                console.warn('Cleanup error:', e);
              }
            });
          });
        });

        console.log('✅ Components registered');

        // Initialize layout
        glLayout.init();
        console.log('✅ Golden Layout initialized');

        isInitializedRef.current = true;
        layoutRef.current = glLayout;

        // Update active panels state
        updateActivePanels(glLayout);

        // Save layout after successful initialization
        const initialSaveTimeout = setTimeout(() => {
          try {
            if (isInitializedRef.current && glLayout && !glLayout.isDestroyed) {
              const config = glLayout.toConfig();
              saveLayout(config);
              console.log('💾 Initial layout saved to localStorage');
            }
          } catch (e) {
            console.error('Initial save error:', e);
          }
        }, 800);

        // Save on ALL changes
        glLayout.on('stateChanged', () => {
          if (isInitializedRef.current) {
            try {
              const openPopouts = glLayout.openPopouts || [];
              if (glLayout.isSubWindow || openPopouts.length > 0) {
                return;
              }
              const config = glLayout.toConfig();
              saveLayout(config);
              updateActivePanels(glLayout);
            } catch (e) {
              if (!e.message.includes('not yet initialised')) {
                console.error('Save error:', e);
              }
            }
          }
        });

        // Handle resize using a dedicated listener
        const handleResize = () => {
          if (layoutRef.current && layoutRef.current.updateSize) {
            layoutRef.current.updateSize();
          }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup function for this specific initialization
        return () => {
          console.log('🧹 Cleaning up Golden Layout instance...');
          clearTimeout(initialSaveTimeout);
          window.removeEventListener('resize', handleResize);
          
          isInitializedRef.current = false;
          
          // Unmount all React roots
          rootsRef.current.forEach(({ root }) => {
            try {
              root.unmount();
            } catch (e) {
              console.warn('Unmount error during cleanup:', e);
            }
          });
          rootsRef.current.clear();

          // Destroy GL instance
          try {
            if (glLayout && !glLayout.isDestroyed) {
              glLayout.destroy();
            }
          } catch (e) {
            console.error('GL destroy error:', e);
          }
          layoutRef.current = null;
        };
      } catch (error) {
        console.error('❌ Initialization error:', error);
        return null;
      }
    };

    // Use a small delay to ensure the DOM is painted and container dimensions are stable
    const timerId = setTimeout(() => {
      currentCleanup = initLayout();
    }, 150);

    return () => {
      clearTimeout(timerId);
      if (currentCleanup) {
        currentCleanup();
      }
    };
  }, []);

  // Define default panel positions (column index and order within column)
  const PANEL_POSITIONS = {
    chart: { column: 0, order: 0 },  // Left column, first
    table: { column: 0, order: 1 },  // Left column, second
    logs: { column: 1, order: 0 },   // Right column, first
  };

  const handleAddPanel = (type) => {
    if (!layoutRef.current || !isInitializedRef.current) {
      console.warn('⚠️ Layout not ready');
      return;
    }

    if (activePanels.has(type)) {
      addToast(`⚠️ ${info.title} is already on the dashboard`);
      console.log('ℹ️ Panel already exists');
      return;
    }

    try {
      const info = PANEL_REGISTRY[type];
      const glLayout = layoutRef.current;
      const root = glLayout.root;

      // Ensure base structure exists
      if (!root.contentItems.length) {
        root.addItem({ type: 'column', content: [{ type: 'row', content: [] }, { type: 'row', content: [] }] });
      }

      const mainColumn = root.contentItems[0];
      // Ensure we have at least two rows for top/bottom fixed positioning
      while (mainColumn.contentItems.length < 2) {
        mainColumn.addItem({ type: 'row', content: [] });
      }

      const PANEL_MAPPING = {
        chart: { row: 0, pos: 0 },
        map: { row: 0, pos: 1 },
        table: { row: 1, pos: 0 },
        logs: { row: 1, pos: 1 },
      };

      const target = PANEL_MAPPING[type] || { row: 0, pos: 0 };
      const row = mainColumn.contentItems[target.row];
      
      const itemConfig = {
        id: `${type}-${Date.now()}`,
        type: 'component',
        componentType: type,
        title: info.title,
        componentState: {
          panelId: type,
          lastUpdated: Date.now()
        }
      };

      // Add to the designated row at the fixed index
      row.addItem(itemConfig, target.pos);
      
      // Refresh layout size and trigger re-render
      setTimeout(() => {
        if (glLayout && !glLayout.isDestroyed && glLayout.updateSize) {
          glLayout.updateSize();
        }
      }, 50);
      
      // Log panel addition
      createLog('SUCCESS', 'panel_added', `Panel "${type}" added to dashboard`);
      
      console.log(`✅ Panel "${type}" snapped to fixed position Row:${target.row}, Pos:${target.pos}`);
      
      updateActivePanels(glLayout);
    } catch (e) {
      console.error('❌ Error adding panel:', e);
    }
  };

  const handleReset = () => {
    resetLayout();
    window.location.reload();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <div className="controls">
          <div className="btn-group">
            {Object.entries(PANEL_REGISTRY).map(([type, config]) => {
              const isActive = activePanels.has(type);
              return (
                <button
                  key={type}
                  className={`btn btn-add-panel ${isActive ? 'btn-disabled' : ''}`}
                  onClick={() => handleAddPanel(type)}
                  title={isActive ? `${config.title} is already on the dashboard` : `Add ${config.title}`}
                >
                  {config.icon} {config.title}
                </button>
              );
            })}
          </div>
          <button className="btn btn-reset" onClick={handleReset}>
            🔄 Reset Layout
          </button>
          <button className="btn btn-export" onClick={() => exportLayout(layoutRef.current.toConfig())}>
            📥 Export JSON
          </button>
        </div>
      </div>
      <div className="dashboard-container" ref={containerRef} />
      
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
