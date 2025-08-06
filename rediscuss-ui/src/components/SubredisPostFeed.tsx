'use client';

import Response from "@/lib/response";
import { PostDto } from "@/types/dto";

interface PostFeedProps {
  initialPosts: PostDto[];
  subredisId: string;
}


const fetchPosts = async({ pageParam = 1, subredisId }: { pageParam?: number, subredisId: string}) => {
   const response = await fetch(`/api/post/getBySubredis/${subredisId}?page=${pageParam}&pageSize=5`, {
            method: 'GET'
        });

        const data : Response<PostDto[]> = await response.json();

        const posts = data.data;

        return {
          posts,
          nextPage: data.pagination?.totalCount
        }
}

export default function SubredisPostFeed({ initialPosts, subredisId }: PostFeedProps) {

}