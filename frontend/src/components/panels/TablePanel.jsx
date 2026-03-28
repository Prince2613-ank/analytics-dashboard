import React, { useEffect, useState } from 'react';
import { getTableData } from '../../services/api';
import '../styles/panels.css';

const TablePanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tableData = await getTableData();
        setData(tableData);
        setError(null);
      } catch (err) {
        setError('Failed to load table data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="panel-content"><p>Loading table...</p></div>;
  if (error) return <div className="panel-content error"><p>{error}</p></div>;

  return (
    <div className="panel-content">
      {data && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {data.columns.map((col) => (
                  <th key={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, index) => (
                <tr key={index}>
                  {data.columns.map((col) => (
                    <td key={`${index}-${col}`}>{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TablePanel;
