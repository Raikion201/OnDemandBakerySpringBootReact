import axios from 'axios';

// Base URL - adjust to match your Spring Boot backend
axios.defaults.baseURL = 'http://localhost:8080';

// Set default configuration to include cookies on every request
axios.defaults.withCredentials = true;

// Track if we're currently refreshing to prevent multiple refresh calls
// let isRefreshing = false;
// let failedQueue = [];

// // Process failed requests queue
// const processQueue = (error, token = null) => {
//   failedQueue.forEach(prom => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve();
//     }
//   });
  
//   failedQueue = [];
// };

// // Request interceptor
// axios.interceptors.request.use(
//   (config) => {
//     // Log request for debugging (optional)
//     // console.log('Request sent:', config.url);
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor
// axios.interceptors.response.use(
//   (response) => {
//     // Process successful responses'
//     console.log("response", response)
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;
//     console.log(error)
//     // If error is 401 and message indicates token expiration
//     console.log(error.response);
//     if (error.response?.status === 401 && 
//         !originalRequest._retry) {
//       console.log("refreshing token")
//       if (isRefreshing) {
//         // If refresh is in progress, queue this request
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then(() => {
//             return axios(originalRequest);
//           })
//           .catch(err => {
//             return Promise.reject(err);
//           });
//       }
      
//       originalRequest._retry = true;
//       isRefreshing = true;
      
//       try {
//         // Call refresh endpoint - Spring will set new cookies
//         await axios.post('/api/auth/refresh');
        
//         // Process queued requests
//         processQueue(null);
        
//         // Retry the original request
//         isRefreshing = false;
//         return axios(originalRequest);
//       } catch (refreshError) {
//         // Process queued requests with error
//         processQueue(refreshError);
        
//         // Redirect to login on refresh failure
//         isRefreshing = false;
        
//         // Clear any auth-related cookies/storage if needed
        
//         // Redirect to login page
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }
    
//     // For other errors, just reject the promise
//     return Promise.reject(error);
//   }
// );

export default axios;