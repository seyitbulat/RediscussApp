import 'server-only';
import { JsonApiResource, StandardApiResponse } from '@/types/api';
import { UserDto } from '@/types/dto';
import { cookies } from 'next/headers';

export async function getAuthenticatedUser(): Promise<UserDto | null> {
    try {
        const token = (await cookies()).get('token')?.value;
        const response = await fetch(`${process.env.API_BASE_URL}/identity/users/me`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            return null;
        }

        const data: StandardApiResponse<JsonApiResource<UserDto>> = await response.json();

        const user = data.data?.attributes;

        if (!user) {
            return null;
        }

        return user;
    } catch (error) {
        console.log(error);
        return null;
    }
}