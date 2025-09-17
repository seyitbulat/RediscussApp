import JoinButton from "@/components/JoinButton";
import Post from "@/components/Post";
import PostCreate from "@/components/PostCreate";
import PostCreateBasic from "@/components/PostCreateBasic";
import DiscuitPostFeed from "@/components/DiscuitPostFeed";
import Response from "@/lib/response";
import { getDiscuitByName } from "@/lib/discuit"
import { JsonApiResource, StandardApiResponse } from "@/types/api";
import { PostDto } from "@/types/dto";
import { useMutation } from "@tanstack/react-query";
import { BellIcon, LucideCookie, MinusIcon, Plus, PlusIcon, SubscriptIcon, UserCircle, VoteIcon } from "lucide-react";
import { cookies } from "next/headers";


interface DiscuitPageProps {
  params: Promise<{
    name: string;
  }>
}

export default async function DiscuitPage({ params }: DiscuitPageProps) {
  const { name } = await params;

  const discuit = await getDiscuitByName(name);

  const fetchInitialPosts = async () => {
    const token = (await cookies()).get('token')?.value;

    const apiResponse = await fetch(`${process.env.API_BASE_URL}/forum/posts/getbydiscuit/${discuit}?page=${1}&pageSize=${5}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });


    if (!apiResponse.ok) {
      return [];
    }

    const data: StandardApiResponse<JsonApiResource<PostDto>[]> = await apiResponse.json();

    const resources: JsonApiResource<PostDto>[] = data.data || [];

    const posts: PostDto[] = resources.map(resource => resource.attributes);

    return posts;
  }

  const isFollowDiscuit = async () => {
    const token = (await cookies()).get('token')?.value;

    const apiResponse = await fetch(`${process.env.API_BASE_URL}/forum/discuits/${discuit?.id}/isFollowDiscuit`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!apiResponse.ok) {
      return false;
    }

    const data: StandardApiResponse<JsonApiResource<boolean>> = await apiResponse.json();

    return data.data?.attributes || false;

  }
  const initialPostsData = await fetchInitialPosts();
  const isFollowed = await isFollowDiscuit();

  return (
    <div className="z-10">
      <div className="justify-center flex grow h-32 ml-12 mr-12">
        <div className="h-32 grow rounded-t-xl bg-white flex items-center relative shadow-lg bg-gradient-to-r from-purple-500 to-pink-500">
          <div>
            <h1 className="p-2 text-2xl text-white font-bold">
              r/{discuit?.name}
            </h1>
            <span className="p-2 text-white/70">{discuit?.description}</span>
          </div>
         {!isFollowed &&
           <JoinButton discuitId={discuit?.id || ""} />
         }
        </div>
      </div>

      <div className="ml-12 mr-12">
        <PostCreateBasic discuitId={discuit?.id || ""} />
      </div>

      <div className="m-12 p-2">

        <DiscuitPostFeed discuitId={discuit?.id || ""} initialPosts={initialPostsData} />

      </div>
    </div>
  );
}