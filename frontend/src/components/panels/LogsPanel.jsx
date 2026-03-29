import React, { useEffect, useState } from 'react';
import '../styles/panels.css';

const LogsPanel = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ws = null;

    const connectWebSocket = () => {
      // In production, might want environment variable
      const wsUrl = `ws://localhost:8000/api/logs/stream`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.success && data.data) {
            setLogs(data.data.logs || []);
            setLoading(false);
          }
        } catch (e) {
          console.error("Error parsing logs:", e);
        }
      };

      ws.onerror = (err) => {
        setError('WebSocket error connecting to logs stream.');
      };

      ws.onclose = () => {
        // Simple reconnect logic
        setTimeout(() => connectWebSocket(), 5000);
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
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

  if (loading && logs.length === 0) return <div className="panel-content"><p>Connecting to live logs...</p></div>;
  if (error && logs.length === 0) return <div className="panel-content error"><p>{error}</p></div>;  

  return (
    <div className="panel-content">
      <div className="logs-container">
        {logs && logs.length > 0 ? (
          logs.map((log) => {
            const { absolute, relative } = formatTimestamp(log.timestamp);      
            return (
              <div key={log.id || log._id} className={`log-entry ${getLogTypeClass(log.type)}`}>
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
