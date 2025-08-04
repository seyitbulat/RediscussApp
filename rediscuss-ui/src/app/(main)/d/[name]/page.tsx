import { getSubredisByName, getSubredisPosts } from "@/lib/subredis"
import { useMutation } from "@tanstack/react-query";
import { UserCircle } from "lucide-react";



interface SubredisPageProps {
  params: {
    name: string;
  }
}

export default async function SubredisPage({ params }: SubredisPageProps) {
  const { name } = await params;

  const subredis = await getSubredisByName(name);
  const posts = await getSubredisPosts(subredis ? subredis.id : "");


  const post = useMutation({
    mutationFn: getSubredisPosts(subredis ? subredis.id : ""),
    onSuccess: () => {
      
    }
  });

  return (
    <div className="">
      <div className="justify-center flex grow-1 border border-secondary-200 h-60 rounded-xl ml-12 mr-12 flex-col">
        <div className="h-30 grow-1 rounded-xl bg-white shadow flex-1/2">
        </div>
        <div className="flex-1/2">
          <h1>
            d/{subredis?.name}
          </h1>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <div className="flex-2/3">
          <div className="">
            left-side
          </div>
        </div>
        <div className="flex-1/3">
          right-side
        </div>
      </div>
    </div>
  );
}