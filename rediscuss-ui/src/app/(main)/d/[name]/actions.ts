"use server";
import { JsonApiResource, StandardApiResponse } from "@/types/api";
import { PostDto, Vote } from "@/types/dto";
import { cookies } from "next/headers";




export async function getPostsAction(subredisId: string, pageParam: number, pageSize: number = 5) {
    const token = (await cookies()).get("token")?.value;
    const apiResponse = await fetch(`${process.env.API_BASE_URL}/forum/posts/getbysubredis/${subredisId}?page=${pageParam}&pageSize=${5}`, {
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



export async function setPostAction(title: string, content: string, subredisId: string) {
    const token = (await cookies()).get("token")?.value;

    const apiResponse = await fetch(`${process.env.API_BASE_URL}/forum/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, subredisId })
    });

    if (!apiResponse.ok) {
        throw new Error(apiResponse.statusText);
    }

    const data: StandardApiResponse<JsonApiResource<PostDto>> = await apiResponse.json();

    return data.data?.attributes;
}


export async function followSubredis(subredisId: string) {
    const token = (await cookies()).get("token")?.value;

    const apiResponse = await fetch(`${process.env.API_BASE_URL}/forum/Subredises/${subredisId}/follow`, {
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