import Response from "@/lib/response";
import { JsonApiResource, StandardApiResponse } from "@/types/api";
import { PostDto } from "@/types/dto";
import { error } from "console";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";




export async function GET(request: NextRequest, { params }: { params: Promise<{ subredisId: string }> }) {
    try {
        const { subredisId } = await params;

        const searchParams = request.nextUrl.searchParams;

        const page = searchParams.get('page');
        const pageSize = searchParams.get('pageSize');

        const token = (await cookies()).get('token')?.value;

        const apiResponse = await fetch(`${process.env.API_BASE_URL}/forum/posts/getbysubredis/${subredisId}?page=${page}&pageSize=${pageSize}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
        });


        if (!apiResponse.ok) {
            const errorResponse = {error: apiResponse.statusText}
            return NextResponse.json(errorResponse, {status: 500, statusText: apiResponse.statusText});
        }


        const data: StandardApiResponse<JsonApiResource<PostDto>[]> = await apiResponse.json();

        const subredisPosts = data.data?.map(s => s.attributes);
        const {totalCount, totalPages} = data?.meta ?? {totalCount: 0, totalPages: 0}
        const response: Response<PostDto[]> = {
            data: subredisPosts ?? [],
            pagination: {
                totalCount: totalCount,
                totalPages: totalPages
            }
        };

        return NextResponse.json(response, {status: 200});
    } catch (error) {

    }
}