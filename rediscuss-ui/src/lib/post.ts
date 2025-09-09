import { JsonApiResource, StandardApiResponse } from "@/types/api";
import { PostDto } from "@/types/dto";
import { cookies } from "next/headers";



export async function getSubredisPosts(subredisId: string, options: { page: number, pageSize: number }): Promise<PostDto[] | null> {
    try {
        const { page, pageSize } = options;
        const token = (await cookies()).get('token')?.value;

        const response = await fetch(`${process.env.API_BASE_URL}/forum/posts/getbysubredisid/${subredisId}?page=${page}&pageSize=${pageSize}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
        });


        if (!response.ok) {
            return null;
        }

        const data: StandardApiResponse<JsonApiResource<PostDto>[]> = await response.json();

        const subredisPosts = data.data?.map(s => s.attributes);


        return subredisPosts || [];
    } catch (error) {
        return null;
    }
}
