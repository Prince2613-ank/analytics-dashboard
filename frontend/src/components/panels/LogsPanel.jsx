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
        const logsData = await getLogs(15);
        setLogs(logsData.logs);
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

  if (loading) return <div className="panel-content"><p>Loading logs...</p></div>;
  if (error) return <div className="panel-content error"><p>{error}</p></div>;

  return (
    <div className="panel-content">
      <div className="logs-container">
        {logs && logs.length > 0 ? (
          logs.map((log) => (
            <div key={log.id} className={`log-entry ${getLogTypeClass(log.type)}`}>
              <span className="log-type">{log.type}</span>
              <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        ) : (
          <p>No logs available</p>
        )}
      </div>
    </div>
  );
};

export default LogsPanel;
