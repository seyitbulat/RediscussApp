import PagePost from "@/components/PagePost";
import Post from "@/components/Post";
import { getPostById } from "@/lib/post";



interface PostPageProps {
    params: {
        id: string
    }
};


export default async function PostPage({ params }: PostPageProps) {
    const { id } = await params;

    const post = await getPostById(id);

    if (post == null) {

    }
    return (
        (post &&
            <div className="m-12 p-2">

                <PagePost postDto={post} discuitId={post.discuit.id} queryKey={["Page Post"]} />

            </div>
        )
    );
}