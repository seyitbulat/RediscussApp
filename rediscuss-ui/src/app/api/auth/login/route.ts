import { JsonApiResource, StandardApiResponse } from "@/types/api";
import { TokenDto } from "@/types/dto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { username, password, rememberMe = false } = body;



        const apiResponse = await fetch(`${process.env.API_BASE_URL}/identity/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        });


       
        const data: StandardApiResponse<JsonApiResource<TokenDto>> = await apiResponse.json();

        if (apiResponse.status !== 200) {
            const errorMessage = data.errors?.[0]?.detail;
            return NextResponse.json({ message: errorMessage || "API Hatasi" }, { status: apiResponse.status || 400 });
        }

        const token  = data.data?.attributes?.token;

        if (!token) {
            return NextResponse.json({ message: "Token alınamadı, API yanıtı beklenmedik formatta." }, { status: 500 });
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