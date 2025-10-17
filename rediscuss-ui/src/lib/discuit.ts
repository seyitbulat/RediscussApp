'use server';
import { JsonApiResource, StandardApiResponse } from "@/types/api";
import { PostDto, DiscuitDto } from "@/types/dto"
import { cookies } from "next/headers"



export async function getDiscuitByName(discuitName: string): Promise<DiscuitDto | null> {
    try {
        const token = (await cookies()).get('token')?.value;

        const response = await fetch(`${process.env.APi_BASE_URL}/forum/discuits/${discuitName}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
        })

        if (!response.ok) {
            return null;
        }

        const data: StandardApiResponse<JsonApiResource<DiscuitDto>> = await response.json();

        const discuit = data.data?.attributes;

        return discuit || null;
    } catch (error) {
        return null;
    }
}



export async function setDiscuit(name: string, description?: string): Promise<DiscuitDto | null> {
    try {
        const token = (await cookies()).get('token')?.value;

        const response = await fetch(`${process.env.Api_BASE_URL}/forum/discuits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name, description }),
            cache: 'no-store'
        });

        if (!response.ok) {
            return null;
        }

        const data: StandardApiResponse<JsonApiResource<DiscuitDto>> = await response.json();
        const discuit = data.data?.attributes;

        return discuit || null;
    } catch (error) {
        return null;

    }
}


export async function followDiscuit(discuitId: string): Promise<boolean> {
    try {
        const token = (await cookies()).get('token')?.value;

        const response = await fetch(`${process.env.Api_BASE_URL}/forum/follows`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ discuitId }),
            cache: 'no-store'
        });

        if (!response.ok) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}