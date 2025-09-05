'use server';

import { JsonApiResource, StandardApiResponse } from "@/types/api";
import { TokenDto } from "@/types/dto";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export interface LoginFormState {
    error: string | null;
    success: boolean;
}

export async function login(prevState: LoginFormState, formData: FormData): Promise<LoginFormState> {
    const username = formData.get("username");
    const password = formData.get("password");
    const rememberMe = formData.get("rememberMe") === "on";

    try {
        const apiResponse = await fetch(`${process.env.API_BASE_URL}/identity/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        var data: StandardApiResponse<JsonApiResource<TokenDto>> = await apiResponse.json();

        const token = data?.data?.attributes?.token;
        if (!token) {
            return { error: "Token alınamadı, API yanıtı beklenmedik formatta.", success: false };
        }
        const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60;

        (await cookies()).set('token', token, {
            httpOnly: true,
            maxAge: maxAge,
            path: '/'
        });

    } catch (error) {
        return { error: 'Sunucu tarafında bir sorun oluştu.', success: false };
    }

    redirect('/');
}



export async function logout() {
    (await cookies()).delete('token');
    redirect('/');
}