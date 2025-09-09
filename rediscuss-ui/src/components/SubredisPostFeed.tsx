'use client';

import Response from "@/lib/response";
import { PostDto } from "@/types/dto";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useCallback, useMemo, useRef, useState } from "react";
import Post from "./Post";

interface PostFeedProps {
  initialPosts: PostDto[];
  subredisId: string;
}


const fetchPosts = async ({ pageParam = 1, subredisId }: { pageParam?: number, subredisId: string }) => {
  const response = await fetch(`/api/post/getBySubredis/${subredisId}?page=${pageParam}&pageSize=5`, {
    method: 'GET'
  });

  const data: Response<PostDto[]> = await response.json();

  const posts = data.data;

  return {
    posts,
    nextPage: pageParam + 1,
    hasPage: data.pagination ? pageParam < data.pagination.totalPages : false
  }
}

export default function SubredisPostFeed({ initialPosts, subredisId }: PostFeedProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);


  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['posts', subredisId],
    queryFn: ({ pageParam = 1 }) => fetchPosts({ pageParam, subredisId }),
    initialPageParam: 1,
    getNextPageParam: ({ nextPage, hasPage }) => hasPage ? nextPage : undefined,
    initialData: {
      pages: [{
        posts: initialPosts,
        nextPage: 2,
        hasPage: initialPosts.length > 0
      }],
      pageParams: [1]
    }
  });


  const lastPostElementRef = useCallback((node: HTMLLIElement | null) => {
    if (isFetchingNextPage) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (node) observerRef.current.observe(node);
  }, [isFetchingNextPage, fetchNextPage, hasNextPage]);


  const allPosts = useMemo(() => {
    const allFetchedPosts = data?.pages?.flatMap(page => page.posts || []);

    return allFetchedPosts && allFetchedPosts.length > 0 ? allFetchedPosts : initialPosts;
  }, [data, initialPosts]);


  
  return (
    <div>
      <ul className="space-y-2">
        {allPosts.map((post, index) => {
          const isFirst = index === 0;
          const isLast = index === allPosts.length - 1

          const item = (
            <li
              key={post.id}
              ref={isLast ? lastPostElementRef : null}
              className="border border-secondary-200 rounded-xl bg-secondary-50/70 hover:border-primary-400"
            >
              <Post postDto={post} />
            </li>
          );

          if (isFirst) {
            return (
              <React.Fragment key={`frag-${post.id}`}>
                {item}
                {/* <li key={`${post.id}-sep`} role="none">
                  <div className="my-1 h-px bg-secondary-400" role="separator" />
                </li> */}
              </React.Fragment>
            );
          } else if (isLast) {
            return item;
          } else {
            return (
              <React.Fragment key={`frag-${post.id}`}>
                {item}
                {/* <li key={`${post.id}-sep`} role="none">
                  <div className="my-1 h-px bg-secondary-400" role="separator" />
                </li> */}
              </React.Fragment>
            );
          }

          return (<></>);
        })}
      </ul>
    </div>
  );
}