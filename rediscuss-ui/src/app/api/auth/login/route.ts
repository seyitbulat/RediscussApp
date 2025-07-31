import api from "@/lib/api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { username, password, rememberMe = false } = body;

        const apiResponse = await api.post('/auth/login', {username, password})

       
        const data = await apiResponse.data;

        if (apiResponse.status !== 200) {
            return NextResponse.json({ message: data.message || "API Hatasi" }, { status: apiResponse.status || 400 });
        }

        const { token } = data

        if (!token) {
            return NextResponse.json({ message: data.message || "Token Alinamadi" }, { status: apiResponse.status || 400 });
        }

        const response = NextResponse.json({ message: 'Giriş başarılı' }, { status: 200 });

        const maxAge = rememberMe
            ? 60 * 60 * 24
            : 60;

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: false,
            maxAge: maxAge,
            path: '/'
        });



        return response;
    } catch (error) {
        return NextResponse.json({ message: 'Sunucu Tarafinda Bir Sorun Olustu' }, { status: 500 });
    }
}