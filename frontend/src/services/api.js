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
    const response = await api.get('/chart');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw error;
  }
};

export const getTableData = async () => {
  try {
    const response = await api.get('/table');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching table data:', error);
    throw error;
  }
};

export const getLogs = async (limit = 20, category = null) => {
  try {
    let url = `/logs?limit=${limit}`;
    if (category) {
      url += `&category=${category}`;
    }
    const response = await api.get(url);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
};

export const getMapData = async () => {
  try {
    const response = await api.get('/map');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching map data:', error);
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

export const createLog = async (type, action, message) => {
  try {
    const response = await api.post('/logs', { type, action, message });
    return response.data;
  } catch (error) {
    console.error('Error creating custom log:', error);
    return null;
  }
};

export default api;
