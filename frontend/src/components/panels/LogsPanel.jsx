import React, { useEffect, useState } from 'react';
import { getLogs } from '../../services/api';
import '../styles/panels.css';

const LogsPanel = () => {
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await getLogs(15, 'BUSINESS');
        // Using provided safe access pattern
        const logsArr = data?.logs || [];
        setLogs(logsArr);
        setError(null);
      } catch (err) {
        setError('Failed to load logs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    // Refresh logs every 10 seconds
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const getLogTypeClass = (type) => {
    return `log-${type.toLowerCase()}`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return { absolute: '--:--', relative: 'No time' };
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return { absolute: 'Invalid', relative: 'Invalid' };

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    let relative = '';
    if (diffInSeconds < 5) relative = 'Just now';
    else if (diffInSeconds < 60) relative = `${diffInSeconds}s ago`;
    else if (diffInSeconds < 3600) relative = `${Math.floor(diffInSeconds / 60)}m ago`;
    else if (diffInSeconds < 86400) relative = `${Math.floor(diffInSeconds / 3600)}h ago`;
    else relative = date.toLocaleDateString();

    return {
      absolute: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      relative: relative
    };
  };

  if (loading) return <div className="panel-content"><p>Loading logs...</p></div>;
  if (error) return <div className="panel-content error"><p>{error}</p></div>;

  return (
    <div className="panel-content">
      <div className="logs-container">
        {logs && logs.length > 0 ? (
          logs.map((log) => {
            const { absolute, relative } = formatTimestamp(log.timestamp);
            return (
              <div key={log.id} className={`log-entry ${getLogTypeClass(log.type)}`}>
                <div className="log-header">
                  <span className="log-type">{log.type}</span>
                  <div className="log-time-group">
                    <span className="log-time-abs">{absolute}</span>
                    <span className="log-time-rel">{relative}</span>
                  </div>
                </div>
                <span className="log-message">{log.message}</span>
              </div>
            );
          })
        ) : (
          <p>No logs available</p>
        )}
      </div>
    </div>
  );
};

export default LogsPanel;
