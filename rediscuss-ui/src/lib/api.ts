import axios from "axios";
import { cookies } from "next/headers";


const API_BASE_URL = process.env.API_BASE_URL;


const api = axios.create({
    baseURL: API_BASE_URL
});


api.interceptors.request.use(async (config) => {
    if (typeof window !== 'undefined') {
        const token = (await cookies()).get('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, error => {
    return Promise.reject(error);
});


export default api; 