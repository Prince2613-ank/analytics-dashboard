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
          Sales: chartData.datasets[0] ? chartData.datasets[0].data[index] : 0,
          Revenue: chartData.datasets[1] ? chartData.datasets[1].data[index] : 0,
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

  if (loading) return <div className="panel-content"><p>Loading chartData...</p></div>;
  if (error) return <div className="panel-content error"><p>{error}</p></div>;

  return (
    <div className="panel-content">
      {data && (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend verticalAlign="top" height={36}/>
            <Line type="monotone" dataKey="Sales" stroke="#4bc0c0" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Revenue" stroke="#ff6384" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ChartPanel;
