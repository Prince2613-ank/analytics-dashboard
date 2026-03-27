import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import GoldenLayout from 'golden-layout';
import { getPanelComponent, PANEL_REGISTRY } from '../utils/panelRegistry';
import { loadLayout, saveLayout, resetLayout } from '../services/layoutService';
import './styles/dashboard.css';
import './styles/golden-layout-override.css';

const Dashboard = () => {
  const containerRef = useRef(null);
  const layoutRef = useRef(null);
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load saved layout or use default
    const savedLayout = loadLayout();
    setLayout(savedLayout);

    // Initialize Golden Layout
    const config = savedLayout;
    const glLayout = new GoldenLayout(config, containerRef.current);

    // Register all panel components
    Object.keys(PANEL_REGISTRY).forEach((panelType) => {
      glLayout.registerComponent(panelType, (container, componentState) => {
        const Component = getPanelComponent(panelType);
        const root = document.createElement('div');
        root.style.width = '100%';
        root.style.height = '100%';
        container.getElement().appendChild(root);

        // Render React component
        const element = React.createElement(Component, { state: componentState });
        const domRoot = ReactDOM.createRoot(root);
        domRoot.render(element);

        // Handle container destroy
        container.on('destroy', () => {
          try {
            domRoot.unmount();
          } catch (e) {
            console.error('Error unmounting component:', e);
          }
        });
      });
    });

    // Save layout when it changes
    glLayout.on('stateChanged', () => {
      const state = glLayout.toConfig();
      saveLayout(state);
      setLayout(state);
    });

    glLayout.on('initialised', () => {
      console.log('Golden Layout initialized');
    });

    glLayout.init();
    layoutRef.current = glLayout;

    // Handle window resize
    const handleResize = () => {
      if (layoutRef.current) {
        layoutRef.current.updateSize();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (layoutRef.current) {
        layoutRef.current.destroy();
      }
    };
  }, []);

  const handleAddPanel = (panelType) => {
    if (!layoutRef.current) return;

    const panelInfo = PANEL_REGISTRY[panelType];
    if (!panelInfo) return;

    layoutRef.current.root.contentItems[0].addChild({
      type: 'component',
      componentType: panelType,
      componentState: {},
      title: panelInfo.title,
    });
  };

  const handleResetLayout = () => {
    if (window.confirm('Are you sure you want to reset the layout to default?')) {
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
            {Object.entries(PANEL_REGISTRY).map(([type, config]) => (
              <button
                key={type}
                className="btn btn-add-panel"
                onClick={() => handleAddPanel(type)}
                title={`Add ${config.title}`}
              >
                {config.icon} {config.title}
              </button>
            ))}
          </div>
          <button className="btn btn-reset" onClick={handleResetLayout}>
            🔄 Reset Layout
          </button>
        </div>
      </div>
      <div className="dashboard-container" ref={containerRef} />
    </div>
  );
};

export default Dashboard;
