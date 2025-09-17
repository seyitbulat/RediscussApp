'use server';
import { JsonApiResource, StandardApiResponse } from "@/types/api";
import { PostDto, Vote } from "@/types/dto";
import { cookies } from "next/headers";

interface FetchPostsPaginationResult {
  posts: PostDto[];
  nextPage: number;
  hasNextPage: boolean;
}

export async function getDiscuitPosts(discuitId: string, options: { page: number, pageSize: number }): Promise<PostDto[] | null> {
    try {
        const { page, pageSize } = options;
        const token = (await cookies()).get('token')?.value;

        const response = await fetch(`${process.env.API_BASE_URL}/forum/posts/getbydiscuitid/${discuitId}?page=${page}&pageSize=${pageSize}`, {
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

        const discuitPosts = data.data?.map(s => s.attributes);


        return discuitPosts || [];
    } catch (error) {
        return null;
    }
}


export async function getHomeFeedPosts(options: { page: number, pageSize: number }) : Promise<FetchPostsPaginationResult | null> {
    const { page, pageSize } = options;
    const token = (await cookies()).get('token')?.value;

    try {
        const response = await fetch(`${process.env.API_BASE_URL}/forum/posts/feed?page=${page}&pageSize=${pageSize}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            return null;
        }

        const data: StandardApiResponse<JsonApiResource<PostDto>[]> = await response.json();


        const posts = (data.data ?? []).map((r) => r.attributes);
        const totalPages = data?.meta?.totalPages ?? 0;

        return {
            posts,
            nextPage: page + 1,
            hasNextPage: totalPages ? page < totalPages : false,
        };
    }
    catch (error) {
        return null;
    }
}


export async function getPostsAction(discuitId: string, pageParam: number, pageSize: number = 5) {
    const token = (await cookies()).get("token")?.value;
    const apiResponse = await fetch(`${process.env.API_BASE_URL}/forum/posts/getbydiscuit/${discuitId}?page=${pageParam}&pageSize=${5}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        },
        cache: 'no-store'
    });

    if (!apiResponse.ok) {
        throw new Error(apiResponse.statusText);
    }


    const data: StandardApiResponse<JsonApiResource<PostDto>[]> = await apiResponse.json();
    const posts = (data.data ?? []).map((r) => r.attributes);
    const totalPages = data?.meta?.totalPages ?? 0;

    return {
        posts,
        nextPage: pageParam + 1,
        hasNextPage: totalPages ? pageParam < totalPages : false,
    };
}



export async function setPostAction(title: string, content: string, discuitId: string) {
    const token = (await cookies()).get("token")?.value;

    const apiResponse = await fetch(`${process.env.API_BASE_URL}/forum/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, discuitId })
    });

    if (!apiResponse.ok) {
        throw new Error(apiResponse.statusText);
    }

    const data: StandardApiResponse<JsonApiResource<PostDto>> = await apiResponse.json();

    return data.data?.attributes;
}


export async function followDiscuit(discuitId: string) {
    const token = (await cookies()).get("token")?.value;

    const apiResponse = await fetch(`${process.env.API_BASE_URL}/forum/discuits/${discuitId}/follow`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    });

    if (!apiResponse.ok) {
        throw new Error(apiResponse.statusText);
    }

    const data: StandardApiResponse<JsonApiResource<PostDto>> = await apiResponse.json();

    return data.data?.attributes;

}



export async function votePost(postId: string, isUpvote: boolean) {
    const token = (await cookies()).get("token")?.value;

    const apiResponse = await fetch(`${process.env.API_BASE_URL}/forum/votes/post`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ postId, direction: isUpvote ? 1 : -1 })
    });

    if (!apiResponse.ok) {
        throw new Error(apiResponse.statusText);
    }

    const data: StandardApiResponse<JsonApiResource<Vote>> = await apiResponse.json();

    return data.data?.attributes;

}