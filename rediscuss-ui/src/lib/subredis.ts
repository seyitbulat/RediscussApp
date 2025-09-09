import { JsonApiResource, StandardApiResponse } from "@/types/api";
import { PostDto, SubredisDto } from "@/types/dto"
import { cookies } from "next/headers"



export async function getSubredisByName(subredisName: string): Promise<SubredisDto | null>{
    try {
        const token = (await cookies()).get('token')?.value;

        const response = await fetch(`${process.env.APi_BASE_URL}/forum/subredises/GetByName/${subredisName}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
        })

        if(!response.ok){
            return null;
        }

        const data : StandardApiResponse<JsonApiResource<SubredisDto>> = await response.json();

        const subredis = data.data?.attributes;

        return subredis || null;
    } catch (error) {
        return null;
    }
}


