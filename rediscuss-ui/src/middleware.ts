import { cookies } from "next/headers";
import { refreshToken } from "./lib/actions/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token');
    const refreshTokenStr = request.cookies.get('refreshToken');
    const { pathname } = request.nextUrl;

    if (!token && !refreshTokenStr && pathname !== '/login' && pathname !== '/register') {
        return NextResponse.redirect(new URL('/login', request.url));
    } else if (!token && refreshTokenStr && pathname !== '/login') {
        await refreshToken();
        return NextResponse.next();

    }



    if (token && pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}


export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}