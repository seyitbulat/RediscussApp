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
            body: JSON.stringify({ username, password, rememberMe })
        });

        var data: StandardApiResponse<JsonApiResource<TokenDto>> = await apiResponse.json();

        const token = data?.data?.attributes?.token;
        const refreshToken = data?.data?.attributes?.refreshToken;

        const tokenExpiresIn = data?.data?.attributes?.accessTokenExpiresIn;
        const refreshTokenExpiresIn = data?.data?.attributes?.refreshTokenExpiresIn;

        if (!token) {
            return { error: "Token alınamadı, API yanıtı beklenmedik formatta.", success: false };
        }

        if (!refreshToken) {
            return { error: "Token alınamadı, API yanıtı beklenmedik formatta.", success: false };
        }

        const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60;

        (await cookies()).set('token', token, {
            httpOnly: true,
            maxAge: tokenExpiresIn,
            path: '/'
        });

        (await cookies()).set('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: refreshTokenExpiresIn,
            path: '/'
        });


    } catch (error) {
        return { error: 'Sunucu tarafında bir sorun oluştu.', success: false };
    }

    redirect('/');
}



export async function logout() {
    (await cookies()).delete('token');
    (await cookies()).delete('refreshToken');
    redirect('/');
}


export async function refreshToken() {
    const refreshToken = (await cookies()).get('refreshToken')?.value;
    if (!refreshToken) {
        logout();
    }

    try {
        const apiResponse = await fetch(`${process.env.API_BASE_URL}/identity/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });


        if (!apiResponse.ok) {
            logout();
        }

        var data: StandardApiResponse<JsonApiResource<TokenDto>> = await apiResponse.json();

        const newToken = data?.data?.attributes?.token;
        const newRefreshToken = data?.data?.attributes?.refreshToken;

        const tokenExpiresIn = data?.data?.attributes?.accessTokenExpiresIn;
        const refreshTokenExpiresIn = data?.data?.attributes?.refreshTokenExpiresIn;

        if (!newToken) {
            return { error: "Token alınamadı, API yanıtı beklenmedik formatta.", success: false };
        }

        if (!newRefreshToken) {
            return { error: "Token alınamadı, API yanıtı beklenmedik formatta.", success: false };
        }

        const maxAge = 60 * 60 * 24 * 7;

        (await cookies()).set('token', newToken, {
            httpOnly: true,
            maxAge: tokenExpiresIn,
            path: '/'
        });

        (await cookies()).set('refreshToken', newRefreshToken, {
            httpOnly: true,
            maxAge: refreshTokenExpiresIn,
            path: '/'
        });
        return data?.data?.attributes;
    } catch (error) {
        logout();
    }
}
