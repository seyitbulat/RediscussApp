import { cookies } from 'next/headers';
import 'server-only';

export interface User {
    userId: number,
    username: string,
    email: string
}

export async function getAuthenticatedUser(): Promise<User | null> {
    try {
        const token = (await cookies()).get('token')?.value;
        const response = await fetch(`${process.env.API_BASE_URL}/users/me`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            return null;
        }

        const user: User = await response.json();
        return user;
    } catch (error) {
        return null;
    }
}