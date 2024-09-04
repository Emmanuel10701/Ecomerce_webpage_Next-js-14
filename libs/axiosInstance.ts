import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api/auth2', // Set base URL to the root API path
  headers: {
    'Content-Type': 'application/json',
  },
});
