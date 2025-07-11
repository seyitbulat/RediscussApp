import { UserLoginCredentials, AuthTokenResponse } from "@/app/types/auth";

const API_URL_BASE = "http://localhost:5293";


export const login = async (credentials: UserLoginCredentials) : Promise<AuthTokenResponse> => {
    const response = await fetch(`${API_URL_BASE}/gateway/auth/login`, {
        method: "POST",
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(credentials)
    });


    if(!response.ok){
         const errorData = await response.json();
         throw new Error(errorData.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
    }
    return response.json();
}