'use client';

import React, { useEffect } from "react";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from "@mui/material";

 
interface User{
    UserId : number,
    Username: string,
    Email: string,
    CreatedAt: Date
}

export default function AuthGuard({children} : {children: React.ReactNode}){
    const router = useRouter();
    const token = typeof window !== 'undefined' ? localStorage.getItem("token"): null;

    const {data, isLoading, isError, isSuccess} = useQuery<User>({
        queryKey: ['me'],
        queryFn: () => api.get('/gateway/users/me'),
        enabled: !!token,
        retry: false
    });

    useEffect(() => {
        if((!isSuccess && !isLoading) || isError){
            localStorage.removeItem("token");

            router.replace('/login');
        }
    }, [isLoading, isSuccess, isError, router]);


    if(isLoading || (!isSuccess && !isError)){
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if(isSuccess && data){
            return <>{children}</>;
    }

      return null;

}