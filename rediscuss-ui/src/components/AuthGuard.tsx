'use client';
import api from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


interface meResponse {
    userId: number,
    username: string,
    email: string,
    createdAt: Date
}

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathName = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const verifyUserAuthentication = async () => {
            if (pathName === '/login') {
                setIsLoading(false);
                return;
            }

            const token = localStorage.getItem('token');

            if (!token) {
                router.push('/login');

                return;
            }

            setIsLoading(true);

            try {
                const response = await api.get('/users/me');

                if(response.status === 200){
                            setIsAuthenticated(true);
                }
            } catch (error) {
                setIsAuthenticated(false);
                    router.push('/login');
            }finally{
                setIsLoading(false);
            }

           
        };

        verifyUserAuthentication();
    }, [pathName]);


    if(isLoading){
        return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <div className="text-2xl">Loading...</div>
        </div>
        );
    }

    if(isAuthenticated || pathName === '/login'){
        return(
            children
        );
    }
    return null;
}

export default AuthGuard;