import PagePost from "@/components/PagePost";
import Post from "@/components/Post";
import SinglePostFeed from "@/components/SinglePostFeed";
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
           <SinglePostFeed initialPost={post}/>
        )
    );
}