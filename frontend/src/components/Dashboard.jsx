import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { GoldenLayout } from 'golden-layout';
import { getPanelComponent, PANEL_REGISTRY } from '../utils/panelRegistry';
import { loadLayout, saveLayout, resetLayout, exportLayout } from '../services/layoutService';
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
    if (!containerRef.current || isInitializedRef.current) return;

    const initLayout = () => {
      try {
        // Ensure container exists and is visible
        const container = containerRef.current;
        if (!container) {
          console.error('❌ Container not found');
          return;
        }

        console.log('📐 Container dimensions:', {
          width: container.clientWidth,
          height: container.clientHeight,
        });

        // Load layout config (starts fresh with default)
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

        // Save layout AFTER successful initialization
        setTimeout(() => {
          try {
            const config = glLayout.toConfig();
            saveLayout(config);
            updateActivePanels(glLayout);
            console.log('💾 Initial layout saved to localStorage');
          } catch (e) {
            console.error('Initial save error:', e);
          }
        }, 500);

        // Save on ALL changes
        glLayout.on('stateChanged', () => {
          if (isInitializedRef.current) {
            try {
              // CRITICAL: Block saving if any sub-windows are active. 
              // Without this, the main window saves a "partial" layout missing the popped-out panel.
              const openPopouts = glLayout.openPopouts || [];
              if (glLayout.isSubWindow || openPopouts.length > 0) {
                console.log('⏳ Postponing save: Popout in transition/active');
                return;
              }

              const config = glLayout.toConfig();
              console.log('📝 Layout changed, saving updated config...');
              saveLayout(config);
              updateActivePanels(glLayout);
            } catch (e) {
              // Ignore "layout not yet initialised" errors during destruction
              if (!e.message.includes('not yet initialised')) {
                console.error('Save error:', e);
              }
            }
          }
        });

        // Handle item removal / popout creation
        glLayout.on('itemDestroyed', () => {
          if (isInitializedRef.current) {
            // Give the library time to settle after destruction
            setTimeout(() => {
              try {
                if (glLayout.isSubWindow || (glLayout.openPopouts && glLayout.openPopouts.length > 0)) {
                   return;
                }
                const config = glLayout.toConfig();
                saveLayout(config);
                updateActivePanels(glLayout);
              } catch (e) {
                // Silently handle transition phase errors
              }
            }, 200);
          }
        });

        // Handle resize
        const handleResize = () => {
          if (layoutRef.current && layoutRef.current.updateSize) {
            layoutRef.current.updateSize();
          }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          rootsRef.current.forEach(({ root }) => {
            try {
              root.unmount();
            } catch (e) {
              console.warn('Unmount error:', e);
            }
          });
          rootsRef.current.clear();
          try {
            if (layoutRef.current && layoutRef.current.destroy) {
              layoutRef.current.destroy();
            }
          } catch (e) {
            console.warn('Destroy error:', e);
          }
          isInitializedRef.current = false;
        };
      } catch (error) {
        console.error('❌ Initialization error:', error);
        console.error('Error stack:', error.stack);
      }
    };

    // Small delay to ensure container is measured
    const timeoutId = setTimeout(() => {
      const cleanup = initLayout();
      return cleanup;
    }, 100);

    return () => clearTimeout(timeoutId);
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
        type: 'component',
        componentType: type,
        title: info.title,
      };

      // Add to the designated row at the fixed index
      row.addItem(itemConfig, target.pos);
      
      console.log(`✅ Panel "${type}" snapped to fixed position Row:${target.row}, Pos:${target.pos}`);
      
      updateActivePanels(glLayout);
    } catch (e) {
      console.error('❌ Error adding panel:', e);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset layout to default?')) {
      resetLayout();
      window.location.reload();
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Analytics Dashboard</h1>
        <div className="controls">
          <div className="btn-group">
            {Object.entries(PANEL_REGISTRY).map(([type, config]) => {
              const isActive = activePanels.has(type);
              return (
                <button
                  key={type}
                  className={`btn btn-add-panel ${isActive ? 'btn-disabled' : ''}`}
                  onClick={() => handleAddPanel(type)}
                  disabled={isActive}
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
    </div>
  );
};

export default Dashboard;
