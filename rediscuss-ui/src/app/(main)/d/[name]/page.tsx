import JoinButton from "@/components/JoinButton";
import Post from "@/components/Post";
import SubredisPostFeed from "@/components/SubredisPostFeed";
import Response from "@/lib/response";
import { getSubredisByName } from "@/lib/subredis"
import { PostDto } from "@/types/dto";
import { useMutation } from "@tanstack/react-query";
import { BellIcon, LucideCookie, MinusIcon, Plus, PlusIcon, SubscriptIcon, UserCircle, VoteIcon } from "lucide-react";


interface SubredisPageProps {
  params: {
    name: string;
  }
}

export default async function SubredisPage({ params }: SubredisPageProps) {
  const { name } = await params;

  const subredis = await getSubredisByName(name);

  const fetchInitialPosts = async () => {
    const response = await fetch(`${process.env.NEXT_BASE_URL}/api/post/getBySubredis/${subredis?.id}?page=1&pageSize=5`, {
      method: 'GET'
    });

    const data: Response<PostDto[]> = await response.json();

    const posts = data.data;

    return posts ? posts : [];
  }
  const initialPostsData = await fetchInitialPosts();


  return (
    <div className="z-10">
      <div className="justify-center flex grow-1 border border-secondary-200 h-30 rounded-xl ml-12 mr-12">
        <div className="h-30 grow-1 rounded-xl bg-white flex items-center shadow relative">
          <div className="w-20 h-20 rounded-full m-2 shadow bg-gradient-to-br from-primary to-accent-300"></div>
          <div>
            <h1 className="p-2 text-2xl text-primary">
              r/{subredis?.name}
            </h1>
            <span className="p-2">{subredis?.description}</span>
          </div>
          <JoinButton subredisId={subredis?.id || ""} />
        </div>
      </div>
      <div className="m-12 p-2">

        <SubredisPostFeed subredisId={subredis?.id || ""} initialPosts={initialPostsData} />

      </div>
    </div>
  );
}