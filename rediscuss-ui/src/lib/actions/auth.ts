'use server';

import { JsonApiResource, StandardApiResponse } from "@/types/api";
import { TokenDto, UserDto } from "@/types/dto";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export interface LoginFormState {
    error: string | null;
    success: boolean;
}

export interface RegisterFormState {
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

        const data: StandardApiResponse<JsonApiResource<TokenDto>> = await apiResponse.json();

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

export async function register(prevState: RegisterFormState, formData: FormData): Promise<RegisterFormState> {
    const username = formData.get("username")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();
    const termsAccepted = formData.get("terms") === "on";

    if (!termsAccepted) {
        return { error: "Lütfen kullanım koşullarını kabul edin.", success: false };
    }

    if (!username || !email || !password || !confirmPassword) {
        return { error: "Lütfen tüm alanları doldurun.", success: false };
    }

    if (password !== confirmPassword) {
        return { error: "Şifreler eşleşmiyor.", success: false };
    }

    try {
        const apiResponse = await fetch(`${process.env.API_BASE_URL}/identity/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        if (!apiResponse.ok) {
            let data: StandardApiResponse<JsonApiResource<UserDto>> | undefined;
            const contentType = apiResponse.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                try {
                    data = await apiResponse.json();
                } catch (error) {
                    data = undefined;
                }
            }

            const errorMessage = data?.errors?.[0]?.detail
                || data?.errors?.[0]?.title
                || 'Kayıt işlemi sırasında bir sorun oluştu.';
            return { error: errorMessage, success: false };
        }

        return { error: null, success: true };
    } catch (error) {
        return { error: 'Sunucu tarafında bir sorun oluştu.', success: false };
    }
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

        const data: StandardApiResponse<JsonApiResource<TokenDto>> = await apiResponse.json();

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
