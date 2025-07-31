'use client';

import api from "@/lib/api";
import { EyeIcon, EyeOffIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function Login() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, rememberMe })
            });

            const data = await response.json();

            if (response.ok) {
                router.refresh();
                router.push('/');
            }else{
                setError(data.message || 'Giriş Yapılırken Hata Oluştu');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Geçersiz Kullanıcı Adı veya Parola');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-accent-50 to-primary-50 via-white">
            <div className="inset-0 overflow-hidden absolute">
                <div className="absolute w-40 h-40 rounded-full -top-10 -right-10 opacity-10 animate-pulse bg-primary-500"></div>
                <div className="absolute w-60 h-60 rounded-full -bottom-10 -left-10 opacity-10 animate-pulse bg-primary-600"></div>
                <div className="absolute w-20 h-20 rounded-full top-1/2 opacity-10 animate-bounce bg-primary-200"></div>
            </div>
            <div className="bg-white rounded-xl max-w-sm shadow-lg p-8 w-full">
                <div className="mt-2 text-center">
                    <div className="w-16 h-16 inline-flex bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl justify-center items-center shadow-lg">
                        <span className="font-bold text-white text-2xl select-none">R</span>
                    </div>
                    <h1 className="text-2xl font-semibold mb-6 text-center select-none">Rediscuss</h1>
                </div>
                <form onSubmit={handleLogin}>
                    <div className="relative mt-2 group">

                        <input
                            required
                            type="text"
                            placeholder=" "
                            className="peer w-full border pt-4 pb-1 px-2 border-gray-300 rounded text-sm
                              focus:border-accent-500 focus:outline-none transition-colors"
                            onInput={(e) => e.currentTarget.value ? e.currentTarget.classList.add('has-value') : e.currentTarget.classList.remove('has-value')}
                            onChange={(e) => setUsername(e.target?.value)}
                        />

                        <label className="absolute left-1 top-2.5 pointer-events-none text-transparent select-none transition-all
                        peer-placeholder-shown:top-2.5 peer-placeholder-shown:left-2 peer-placeholder-shown:text-gray-500
                        peer-focus:top-0 peer-focus:text-accent-500
                        peer-[.has-value]:text-accent-500 peer-[.has-value]:top-0 peer-[.has-value]:left-2
                        ">
                            Kullanıcı Adı
                        </label>
                    </div>

                    <div className="relative mt-2 group">
                        <input
                            required
                            type={showPassword ? "text" : "password"}
                            placeholder=" "
                            className="peer w-full border pt-4 pb-1 px-2 border-gray-300 rounded text-sm
                              focus:border-accent-500 focus:outline-none transition-colors"
                            onInput={(e) => e.currentTarget.value ? e.currentTarget.classList.add('has-value') : e.currentTarget.classList.remove('has-value')}
                            onChange={(e) => setPassword(e.target?.value)}
                        />

                        <label className="absolute left-1 top-2.5 pointer-events-none text-transparent select-none transition-all
                        peer-placeholder-shown:top-2.5 peer-placeholder-shown:left-2 peer-placeholder-shown:text-gray-500
                        peer-focus:top-0 peer-focus:text-accent-600
                        peer-[.has-value]:text-accent-500 peer-[.has-value]:top-0 peer-[.has-value]:left-2
                        ">
                            Şifre
                        </label>

                        <button type="button" className="absolute right-2.5 top-2.5" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOffIcon className="text-gray-500" /> : <EyeIcon className="text-gray-500" />}
                        </button>
                    </div>

                    <div className="relative mt-2 flex items-center justify-between text-sm">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 text-secondary-500 border-background-500 checked:bg-primary-300 focus:ring-primary-200" onChange={(e) => setRememberMe(e.target.checked)}/>
                            <span>Beni Hatırla</span>
                        </label>
                        <a href="#" className="text-accent-500">
                            Şifremi Unuttum
                        </a>
                    </div>
                    <div className="relative mt-4 flex justify-center">
                        <button className="w-full h-10 bg-primary-500 rounded shadow-lg text-white font-bold hover:bg-primary-400 transition-colors">Giriş Yap</button>
                    </div>
                </form>
            </div>
        </div>
    );
}