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
            // Wait for popouts to close before saving layout
            if (glLayout.isSubWindow || (glLayout.openPopouts && glLayout.openPopouts.length > 0)) {
               return;
            }
            try {
              const config = glLayout.toConfig();
              console.log('📝 Layout changed, saving...');
              saveLayout(config);
              updateActivePanels(glLayout);
            } catch (e) {
              console.error('Save error:', e);
            }
          }
        });

        // Save when item destroyed
        glLayout.on('itemDestroyed', () => {
          if (isInitializedRef.current) {
            // Do not save if it's a popout triggering the destroy
            if (glLayout.isSubWindow || (glLayout.openPopouts && glLayout.openPopouts.length > 0)) {
               return;
            }
            setTimeout(() => {
              try {
                const config = glLayout.toConfig();
                console.log('📝 Panel removed, saving updated layout...');
                console.log('Remaining panels:', countPanels(config.root));
                saveLayout(config);
                updateActivePanels(glLayout);
              } catch (e) {
                console.error('Save after remove error:', e);
              }
            }, 150);
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

    // Guard: Check if panel already exists using state
    if (activePanels.has(type)) {
      console.log('ℹ️ Panel already exists, skipping add');
      return;
    }

    try {
      const info = PANEL_REGISTRY[type];
      if (!info) return;

      const glLayout = layoutRef.current;
      const ground = glLayout.root;

      console.log('🔍 Adding panel to layout at default position');

      if (!ground) {
        console.error('❌ No root found');
        return;
      }

      let base = ground.contentItems[0] || null;

      // Double-check via DOM traversal (backup guard)
      if (base) {
        const existing = findComponentItem(base, type);
        if (existing) {
          const parent = existing.parent;
          if (parent && typeof parent.setActiveComponentItem === 'function') {
            parent.setActiveComponentItem(existing, true);
          }
          console.log('ℹ️ Panel already exists, activating instead of adding');
          return;
        }
      }

      // If layout is empty, recreate the default two-column structure
      if (!base) {
        console.warn('⚠️ Layout is empty, creating base row with columns');
        ground.addItem({
          type: 'row',
          content: [
            { type: 'column', width: 50, content: [] },
            { type: 'column', width: 50, content: [] },
          ],
        });
        base = ground.contentItems[0] || null;
      }

      if (!base) {
        console.error('❌ Could not determine base layout container');
        return;
      }

      // Ensure we always have at least two columns
      if (!base.contentItems || base.contentItems.length === 0) {
        base.addItem({ type: 'column', width: 50, content: [] });
        base.addItem({ type: 'column', width: 50, content: [] });
      } else if (base.contentItems.length === 1) {
        base.addItem({ type: 'column', width: 50, content: [] });
      }

      // Get the default position for this panel type
      const position = PANEL_POSITIONS[type] || { column: 0, order: 0 };
      const targetColumnIndex = position.column;
      let target = base.contentItems[targetColumnIndex] || base.contentItems[0];

      // Find or use existing stack in the column
      if (target.contentItems && target.contentItems.length > 0) {
        const stack = target.contentItems.find((item) => item.type === 'stack');
        if (stack) {
          target = stack;
        }
      }

      // Calculate insert index based on default order
      let insertIndex = position.order;
      if (target.contentItems) {
        // Count how many panels with lower order already exist
        let existingLowerOrder = 0;
        for (const item of target.contentItems) {
          if (item.isComponent) {
            const itemType = item.config?.componentType;
            const itemPos = PANEL_POSITIONS[itemType];
            if (itemPos && itemPos.order < position.order) {
              existingLowerOrder++;
            }
          }
        }
        // Insert after existing panels with lower order
        insertIndex = Math.min(existingLowerOrder, target.contentItems.length);
      }

      try {
        const itemConfig = {
          type: 'component',
          componentType: type,
          title: info.title,
        };

        if (typeof target.addItem === 'function') {
          target.addItem(itemConfig, insertIndex);
        } else if (typeof target.addChild === 'function') {
          if (typeof insertIndex === 'number') {
            target.addChild(itemConfig, insertIndex);
          } else {
            target.addChild(itemConfig);
          }
        }
        console.log(`✅ Panel "${type}" added at column ${targetColumnIndex}, position ${insertIndex}`);
      } catch (addError) {
        console.error('❌ Error while adding panel:', addError);
        throw addError;
      }

      // Update state and save
      setTimeout(() => {
        try {
          const config = glLayout.toConfig();
          saveLayout(config);
          updateActivePanels(glLayout);
          console.log('💾 Layout saved after adding panel');
        } catch (e) {
          console.error('Save after add error:', e);
        }
      }, 200);
    } catch (e) {
      console.error('❌ Add panel error:', e);
      console.error('Error stack:', e.stack);
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
