// /utils/api.ts

import axios from 'axios';

// Configure axios instance with default settings
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/', // Base URL for the API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to handle POST requests
export const post = async (url: string, data: object) => {
  try {
    const response = await api.post(url, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Function to handle GET requests
export const get = async (url: string) => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Function to handle PUT requests
export const put = async (url: string, data: object) => {
  try {
    const response = await api.put(url, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Function to handle DELETE requests
export const remove = async (url: string) => {
  try {
    const response = await api.delete(url);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Centralized error handling
const handleError = (error: any) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    console.error('API error response:', error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API error request:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API error message:', error.message);
  }
  throw new Error('An error occurred while communicating with the server.');
};
