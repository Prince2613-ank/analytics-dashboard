import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getChartData } from '../../services/api';
import '../styles/panels.css';

const ChartPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const chartData = await getChartData();
        // Transform data for Recharts
        const transformedData = chartData.labels.map((label, index) => ({
          name: label,
          Revenue: chartData.datasets[0].data[index],
          Expenses: chartData.datasets[1].data[index],
        }));
        setData(transformedData);
        setError(null);
      } catch (err) {
        setError('Failed to load chart data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="panel-content"><p>Loading chart...</p></div>;
  if (error) return <div className="panel-content error"><p>{error}</p></div>;

  return (
    <div className="panel-content">
      <h3>Revenue vs Expenses</h3>
      {data && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Revenue" stroke="#4bc0c0" />
            <Line type="monotone" dataKey="Expenses" stroke="#ff6384" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ChartPanel;
