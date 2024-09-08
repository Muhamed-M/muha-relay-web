import axios from 'axios';

const axiosServices = axios.create({
  baseURL: process.env.BACKEND_URL || 'http://192.168.1.6/api',
});

// interceptor for http
axiosServices.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Error fetching data')
);

export default axiosServices;
