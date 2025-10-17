"use client";
import React, { useCallback, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Post from "./Post";
import { PostDto } from "@/types/dto";
import { getHomeFeedPosts } from "@/lib/post";



export default function HomePostFeed({ initialPosts }: {initialPosts: PostDto[]}) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", "home"],
    queryFn: async ({ pageParam = 1 }) => {
      return await getHomeFeedPosts({ page: pageParam, pageSize: 5 });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage?.hasNextPage ? lastPage.nextPage : undefined),
    initialData: {
      pages: [
        {
          posts: initialPosts,
          nextPage: 2,
          hasNextPage: (initialPosts?.length ?? 0) > 0,
        },
      ],
      pageParams: [1],
    },
  });

  const lastPostElementRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  const allPosts = useMemo(() => {
    const allFetched = data?.pages?.flatMap((p) => p?.posts || []);
    return allFetched?.length ? allFetched : initialPosts;
  }, [data, initialPosts]);

  return (
    <div>
      <ul className="space-y-2">
        {allPosts.map((post, index) => {
          const isLast = index === allPosts.length - 1;
          return (
            <li key={post.id} ref={isLast ? lastPostElementRef : null}>
              <Post postDto={post} discuitId={post.discuit.id} queryKey={["posts", "home"]}/>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
