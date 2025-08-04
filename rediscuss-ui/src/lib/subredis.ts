import { JsonApiResource, StandardApiResponse } from "@/types/api";
import { PostDto, SubredisDto } from "@/types/dto"
import { cookies } from "next/headers"

export async function getSubredisPosts(subredisId: string): Promise<PostDto[] | null>{
    try {
        const token = (await cookies()).get('token')?.value;

        const response = await fetch(`${process.env.API_BASE_URL}/forum/posts/getbysubredisid/${subredisId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        
        if (!response.ok) {
            return null;
        }

        const data : StandardApiResponse<JsonApiResource<PostDto>[]> = await response.json();

        const subredisPosts = data.data?.map(s => s.attributes);

       
        return subredisPosts || [];
    } catch (error) {
        return null;
    }
}