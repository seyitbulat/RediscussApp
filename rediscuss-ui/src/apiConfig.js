import axios from 'axios';

const apiClient = axios.create({
    baseURL: "http://localhost:5293/gateway",
    headers: {
        'Content-Type' : 'application/json'
    }
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('jwt_token');
    config.headers.Authorization = `Bearer ${token}`

    return config;
});


export default apiClient;