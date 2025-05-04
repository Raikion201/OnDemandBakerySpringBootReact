import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080';
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

// This function determines if a URL should be treated as a public route (no auth required)
const isPublicRoute = (url = '') => {
  // Very simple check - if the URL contains '/api/products', it's a public route
  return url.includes('/api/products');
};

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Skip auth handling for public routes including all product endpoints
    // This check must happen BEFORE any other auth-related code
    if (originalRequest && isPublicRoute(originalRequest.url)) {
      console.log("Public route detected, skipping auth redirect:", originalRequest.url);
      return Promise.reject(error);
    }
    
    // Only proceed with auth flow for protected routes
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (error.response?.data === "Refresh token is expired") {
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