import JoinButton from "@/components/JoinButton";
import Post from "@/components/Post";
import { getSubredisByName } from "@/lib/subredis"
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

       
      </div>
    </div>
  );
}