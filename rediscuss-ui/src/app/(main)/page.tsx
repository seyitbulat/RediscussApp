import Header from "@/components/Header";
import HomePostFeed from "@/components/HomeFeed";
import Sidebar from "@/components/Sidebar";
import DiscuitPostFeed from "@/components/DiscuitPostFeed";
import { Button } from "@/components/ui/button";
import { getHomeFeedPosts } from "@/lib/post";
import Image from "next/image";

export default async function Home() {
  const feed = await getHomeFeedPosts({ page: 1, pageSize: 10 });
  const posts = feed?.posts || [];
  return (
    <div className="z-10 m-6">
      <HomePostFeed initialPosts={posts} />
    </div>
  );
}