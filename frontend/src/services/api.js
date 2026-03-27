import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

/**
 * API Service: Handles all backend API calls
 */

export const getChartData = async () => {
  try {
    const response = await api.get('/data/chart');
    return response.data;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw error;
  }
};

export const getTableData = async () => {
  try {
    const response = await api.get('/data/table');
    return response.data;
  } catch (error) {
    console.error('Error fetching table data:', error);
    throw error;
  }
};

export const getLogs = async (limit = 20) => {
  try {
    const response = await api.get(`/logs?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
};

export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'unhealthy' };
  }
};

export default api;
