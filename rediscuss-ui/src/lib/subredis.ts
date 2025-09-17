'use server';
import { JsonApiResource, StandardApiResponse } from "@/types/api";
import { PostDto, SubredisDto } from "@/types/dto"
import { cookies } from "next/headers"



export async function getSubredisByName(subredisName: string): Promise<SubredisDto | null> {
    try {
        const token = (await cookies()).get('token')?.value;

        const response = await fetch(`${process.env.APi_BASE_URL}/forum/subredises/GetByName/${subredisName}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
        })

        if (!response.ok) {
            return null;
        }

        const data: StandardApiResponse<JsonApiResource<SubredisDto>> = await response.json();

        const subredis = data.data?.attributes;

        return subredis || null;
    } catch (error) {
        return null;
    }
}



export async function setSubredis(name: string, description?: string): Promise<SubredisDto | null> {
    try {
        const token = (await cookies()).get('token')?.value;

        const response = await fetch(`${process.env.Api_BASE_URL}/forum/subredises`, {
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

        const data: StandardApiResponse<JsonApiResource<SubredisDto>> = await response.json();
        const subredis = data.data?.attributes;

        return subredis || null;
    } catch (error) {
        return null;

    }
}


export async function followSubredis(subredisId: string): Promise<boolean> {
    try {
        const token = (await cookies()).get('token')?.value;

        const response = await fetch(`${process.env.Api_BASE_URL}/forum/subredises/${subredisId}/follow`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
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