import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';

const axiosInstancesPython = axios.create({
    baseURL: import.meta.env.VITE_API_URL2,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstancesPython.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`;
        } else {
            console.warn('Authorization token is missing!');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstancesPython;
