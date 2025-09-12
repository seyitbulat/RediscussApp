import { cookies } from "next/headers";

const api = async (url: string, options: RequestInit = {}) => {
    const token = (await cookies()).get('token')?.value;

    
    const res = await fetch(`${process.env.API_BASE_URL}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if(res.status == 401){
        
    }
}