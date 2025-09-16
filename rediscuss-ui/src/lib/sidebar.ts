import 'server-only';

import { JsonApiResource, StandardApiResponse } from "@/types/api";
import { SubredisDto, UserDto } from "@/types/dto";
import { cookies } from "next/headers";

export async function getSubscriptions(): Promise<SubredisDto[] | null> {
    try {
        const token = (await cookies()).get('token')?.value;
        const response = await fetch(`${process.env.API_BASE_URL}/forum/users/me/subscriptions`, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return null;
        }

        const data: StandardApiResponse<JsonApiResource<SubredisDto>[]> = await response.json();

        const subredises = data.data?.map(resource => resource.attributes);
        if (!subredises) {
            return [];
        }

        return subredises;

    } catch (error) {
        console.log(error);

        return null;
    }
}

export async function getRecommendedSubredises(): Promise<SubredisDto[] | null>{

    try{
        const token = (await cookies()).get('token')?.value;
        const response = await fetch(`${process.env.APi_BASE_URL}/forum/subredises/GetRecommendations`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
        });
        
        if(!response.ok){
            return null;
        }

        const data: StandardApiResponse<JsonApiResource<SubredisDto>[]> = await response.json();

        const subredises = data.data?.map(s => s.attributes);

        return subredises || [];
    }catch(error){
        return null;
    }
}

