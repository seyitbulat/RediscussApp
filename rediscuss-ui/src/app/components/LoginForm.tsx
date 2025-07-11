'use client';

import { useState, FormEvent } from "react";
import { login } from "../services/authService";
export const LoginForm = () => {
    const [username, setusername] = useState('');
    const [password, setpassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        setError(null);
        setIsLoading(true);
        
        try {
            const response = await login({username, password});

            localStorage.setItem("authToken", response.token);

        } catch (error : any) {
            setError(error.message);
        } finally{
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="username">Kullanıcı Adı: </label>
            <input id="username" type="text" value={username} onChange={e => setusername(e.target.value)} required />

            <label htmlFor="password">Parola</label>
            <input id="password" type="password" value={password} onChange={e => setpassword(e.target.value)}/>

            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Giris Yapiliyor' : 'Giris Yap'}
            </button>
        </form>
    );
};


