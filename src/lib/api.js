import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            console.log(`API: Attaching token to ${config.url} (starts with: ${token.substring(0, 10)}...)`);
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            // Whitelist public endpoints to avoid console warnings
            const publicEndpoints = ['/auth/login', '/auth/register'];
            const isPublic = publicEndpoints.some(endpoint => config.url.includes(endpoint));

            if (!isPublic) {
                console.warn(`API Request to ${config.url} without access_token!`);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401s
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Ignore 401s from login endpoint (it just means wrong password, not expired session)
            if (error.config.url.includes('/auth/login')) {
                return Promise.reject(error);
            }
            console.error("API Error: 401 Unauthorized. Dispatching logout event.");
            // Dispatch dynamic event for AuthContext to catch
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        return Promise.reject(error);
    }
);

export default api;
