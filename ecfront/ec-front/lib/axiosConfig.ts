import axios from 'axios';

// Use environment variable for base URL with more robust fallback handling
const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  // If the URL starts with http, use it directly
  if (envUrl?.startsWith('http')) {
    return envUrl;
  }
  
  // If it's a relative path like /api, and we're in the browser, prepend origin
  if (envUrl && typeof window !== 'undefined') {
    // For paths like /api when behind a reverse proxy
    return envUrl;
  }
  
  // Default fallback
  return 'http://localhost:8080';
};

const baseURL = getBaseUrl();
console.log('API Base URL:', baseURL);  // Helpful for debugging

axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true;

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

// Process failed requests queue
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (error.response?.data === "Refresh token is expired" ) {
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axios(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        await axios.post('/api/auth/refresh');
        
        processQueue(null);
        
        isRefreshing = false;
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        
        isRefreshing = false;
        
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios;