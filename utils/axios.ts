import axios from 'axios';

const axiosServices = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// interceptor for http
axiosServices.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Error fetching data')
);

export default axiosServices;
