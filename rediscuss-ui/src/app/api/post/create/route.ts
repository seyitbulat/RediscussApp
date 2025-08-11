import Response from "@/lib/response";
import { JsonApiResource, StandardApiResponse } from "@/types/api";
import { PostDto } from "@/types/dto";
import { ApiError } from "next/dist/server/api-utils";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    const body = await request.json();

    const { title, content, subredisId } = body;

    const token = (await cookies()).get('token')?.value;
    const apiResponse = await fetch(`${process.env.API_BASE_URL}/forum/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({title, content, subredisId})
    });


    if(!apiResponse.ok){
        const errorResponse = {error: apiResponse.statusText};
        return NextResponse.json(errorResponse, {status: 500, statusText: apiResponse.statusText});
    }
    
    const data : StandardApiResponse<JsonApiResource<PostDto>> = await apiResponse.json();

    const response : Response<PostDto> = {
        data: data.data?.attributes
    };

    return NextResponse.json(response, {status: 201});
}