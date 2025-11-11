'use client'
import { getPostById } from "@/lib/post";
import { PostDto } from "@/types/dto";
import { useQuery } from "@tanstack/react-query";
import PagePost from "./PagePost";



export default function SinglePostFeed({ initialPost }: { initialPost: PostDto }) {
    const {
        data,
    } = useQuery({
        initialData: initialPost,
        queryKey: ["PostPage"],
        queryFn: async () => {
            return await getPostById(initialPost.id);
        }
    });

    // Use data from query (which will be updated by mutations) instead of initialPost
    const currentPost = data ?? initialPost;

    return (
        <div className="m-12 p-2">

            <PagePost postDto={currentPost} discuitId={currentPost.discuit.id} queryKey={["PostPage"]} />

        </div>
    );
}
