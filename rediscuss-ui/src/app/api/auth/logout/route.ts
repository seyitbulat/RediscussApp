import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json({message: 'Çıkış Başarılı'}, {status: 200});

        response.cookies.set('token', '', {
            httpOnly: true,
            secure: false,
            maxAge: 0,
            path: '/'
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { message: 'Sunucu tarafında bir hata oluştu' },
            { status: 500 }
        );
    }
}