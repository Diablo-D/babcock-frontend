import axios from 'axios';

// 1. Point this to your Laravel Backend address
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// 2. The Security Guard (Interceptor)
// This checks if you have a login token and attaches it to every request automatically.
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;