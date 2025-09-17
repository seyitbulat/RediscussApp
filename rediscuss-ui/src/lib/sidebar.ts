import 'server-only';

import { JsonApiResource, StandardApiResponse } from "@/types/api";
import { DiscuitDto, UserDto } from "@/types/dto";
import { cookies } from "next/headers";

export async function getSubscriptions(): Promise<DiscuitDto[] | null> {
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

        const data: StandardApiResponse<JsonApiResource<DiscuitDto>[]> = await response.json();

        const discuits = data.data?.map(resource => resource.attributes);
        if (!discuits) {
            return [];
        }

        return discuits;

    } catch (error) {
        console.log(error);

        return null;
    }
}

export async function getRecommendedDiscuits(): Promise<DiscuitDto[] | null>{

    try{
        const token = (await cookies()).get('token')?.value;
        const response = await fetch(`${process.env.APi_BASE_URL}/forum/discuits/GetRecommendations`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
        });
        
        if(!response.ok){
            return null;
        }

        const data: StandardApiResponse<JsonApiResource<DiscuitDto>[]> = await response.json();

        const discuits = data.data?.map(s => s.attributes);

        return discuits || [];
    }catch(error){
        return null;
    }
}

