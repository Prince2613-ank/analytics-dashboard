import ChartPanel from '../components/panels/ChartPanel';
import TablePanel from '../components/panels/TablePanel';
import LogsPanel from '../components/panels/LogsPanel';

/**
 * Panel Registry: Maps panel types to their React components
 * This allows Golden Layout to dynamically render the correct component
 */
export const PANEL_REGISTRY = {
  chart: {
    component: ChartPanel,
    title: 'Chart',
    icon: '📊',
  },
  table: {
    component: TablePanel,
    title: 'Data Table',
    icon: '📋',
  },
  logs: {
    component: LogsPanel,
    title: 'Activity Logs',
    icon: '📝',
  },
};

export const getPanelComponent = (type) => {
  const panel = PANEL_REGISTRY[type];
  return panel ? panel.component : null;
};

export const getPanelInfo = (type) => {
  return PANEL_REGISTRY[type] || null;
};

export const getAvailablePanels = () => {
  return Object.entries(PANEL_REGISTRY).map(([type, config]) => ({
    type,
    title: config.title,
    icon: config.icon,
  }));
};
