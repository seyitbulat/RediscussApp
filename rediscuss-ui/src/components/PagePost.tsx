'use client';
import { PostDto, Vote } from "@/types/dto";
import { ArrowBigDown, ArrowBigUp, BadgeCheck, LucideCookie, MinusIcon, PlusIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { votePost, setPostComment, getPostComments } from "@/lib/post";
import { useState, useEffect } from "react";
import Link from "next/link";
import Comment from "./Comment";
import { CommentDto } from "@/types/dto";

export interface PostProps {
    postDto: PostDto;
    discuitId: string;
    queryKey: string[];
}


export default function PagePost({ postDto, discuitId, queryKey }: PostProps) {
    const queryClient = useQueryClient();
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");

    const mutation = useMutation({
        mutationFn: async (params: { postId: string; isUpvote: boolean }) => {
            const res = await votePost(params.postId, params.isUpvote);
            return res;
        },
        onMutate: async ({ postId, isUpvote }) => {
            await queryClient.cancelQueries({ queryKey: queryKey });
            const previous = queryClient.getQueryData<any>(queryKey);
            queryClient.setQueryData(queryKey, (oldData: any) => {
                if (!oldData) return oldData;
                const pages = oldData.pages?.map((page: any) => ({
                    ...page,
                    posts: (page.posts || []).map((p: PostDto) => {
                        if (p.id !== postId) return p;
                        return {
                            ...p,
                            upChips: isUpvote ? p.upChips + 1 : p.upChips,
                            downChips: !isUpvote ? p.downChips + 1 : p.downChips,
                        } as PostDto;
                    }),
                }));
                return { ...oldData, pages };
            });
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous);
            }
        },
        onSuccess: (vote: Vote | undefined) => {
            if (!vote) return;
            queryClient.setQueryData(queryKey, (oldData: any) => {
                if (!oldData) return oldData;
                const pages = oldData.pages?.map((page: any) => ({
                    ...page,
                    posts: (page.posts || []).map((p: PostDto) => {
                        if (p.id !== postDto.id) return p;
                        return { ...p, upVotes: vote.upVotes, downVotes: vote.downVotes } as PostDto;
                    }),
                }));
                return { ...oldData, pages };
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKey });
        },
    });

    const handleVote = (isUpvote: boolean) => {
        if (mutation.isPending) return;
        mutation.mutate({ postId: postDto.id, isUpvote });
    };

    // Comments may be embedded in the post DTO (server returns them with the post).
    // If they are not present, fall back to lazy-loading via `getPostComments`.
    const commentsQuery = useQuery({
        queryKey: ["postComments", postDto.id],
        queryFn: async () => {
            const res = await getPostComments(postDto.id);
            return res ?? [];
        },
        enabled: !postDto.comments,
    });

    const commentsList = postDto.comments ?? (commentsQuery.data ?? []);
    const commentsCount = postDto.comments ? commentsList.length : (commentsQuery.data ? commentsQuery.data.length : (postDto.commentCount ?? 0));

    // Debug logging to help diagnose why comments may not appear at runtime.
    useEffect(() => {
        try {
            console.debug("Post component debug:", {
                postId: postDto.id,
                hasEmbeddedComments: Array.isArray(postDto.comments),
                embeddedCommentsLength: postDto.comments ? postDto.comments.length : undefined,
                commentCountField: postDto.commentCount,
                commentsQuery: {
                    enabled: !!(showComments && !postDto.comments),
                    isLoading: commentsQuery.isLoading,
                    isError: commentsQuery.isError,
                    dataLength: commentsQuery.data ? commentsQuery.data.length : undefined,
                },
                commentsListLength: commentsList.length
            });
        } catch (e) {
            console.debug("Post debug logging failed", e);
        }
    }, [showComments, postDto, commentsQuery.data]);

    const commentMutation = useMutation({
        mutationFn: async (payload: { text: string; parentCommentId?: string | null }) => {
            return await setPostComment(postDto.id, payload.text, payload.parentCommentId);
        },
        onSuccess: () => {
            setCommentText("");
            // Invalidate the parent posts query so the updated post (with new commentCount/comments)
            // is refetched. Also invalidate the per-post comments query in case we lazy-loaded them.
            queryClient.invalidateQueries({ queryKey: queryKey });
            queryClient.invalidateQueries({ queryKey: ["postComments", postDto.id] });
        }
    });


    const relativeDate = formatDistanceToNow(postDto.createdAt, { addSuffix: true, locale: tr }).replace("yaklaşık", "")
    return (
        <Card
            className="group cursor-pointer overflow-hidden transition-all hover:border-primary/60 hover:shadow-md"
        >
            <article className="h-full">
                <div className="flex h-full flex-col p-4">
                    <header className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 shadow-inner" />
                        <div>
                            <div className="flex flex-wrap items-center gap-1 text-sm text-text-500">
                                <span className="font-medium">{postDto.createdByUsername}</span>
                                <BadgeCheck className="h-4 w-4 text-primary-500" />
                                <span>•</span>
                                {postDto.discuit.name &&
                                    <Link href={`/d/${postDto.discuit.name}`} className="hover:underline">
                                        <span>{postDto.discuit.name}</span>
                                    </Link>
                                }

                                <span>•</span>
                                <span>{relativeDate}</span>
                            </div>
                        </div>
                    </header>

                    <h2 className="mt-3 font-semibold leading-tight">{postDto.title}</h2>
                    <p className="line-clamp-3 mt-2 flex-grow">{postDto.content}</p>

                    <footer className="mt-4 flex">
                        {/* Tasarım İyileştirmesi: Oylama butonları daha modern bir "pill" görünümüne kavuşturuldu. */}
                        <div className="flex h-9 items-center gap-1 rounded-full bg-secondary/50 px-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="group/upVote relative h-8 w-8 rounded-full"
                                onClick={() => handleVote(true)}
                                disabled={mutation.isPending}
                            >
                                <LucideCookie className="w-5 h-5 group-hover/upVote:text-primary-400 transition-all" />

                                <ArrowBigUp
                                    className={`
                                        absolute -top-1 -right-1 w-4 h-4 text-primary-400 transition-all opacity-0 translate-y-5
                                        group-hover/upVote:opacity-100
                                        group-hover/upVote:translate-y-0
                                        ${postDto.chipByUser === 1 ? "opacity-100 translate-y-0" : ""}
                                        `}
                                />
                            </Button>

                            <span className="text-sm flex">{postDto.upChips - postDto.downChips}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="group/downVote relative h-8 w-8 rounded-full"
                                onClick={() => handleVote(false)}
                                disabled={mutation.isPending}
                            >
                                <LucideCookie className="w-5 h-5 group-hover/downVote:text-accent-400 transition-all" />

                                <ArrowBigDown
                                    className={`
                                        absolute -top-1 -right-1 w-4 h-4 text-accent-400 transition-all opacity-0 translate-y-0
                                    group-hover/downVote:opacity-100
                                    group-hover/downVote:translate-y-5
                                    ${postDto.chipByUser === -1 ? "opacity-100 translate-y-5" : ""}
                                    `}
                                />
                            </Button>
                        </div>

                        <div className="ml-3 flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowComments(s => !s)}
                            >
                                Yorumlar ({commentsCount})
                            </Button>
                        </div>
                    </footer>
                    <div className="mt-3 px-4 pb-4">
                        <div className="flex flex-col gap-3">
                            {/* New comment form */}
                            <div className="flex flex-col gap-2">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="w-full rounded-md border p-2 text-sm"
                                    rows={3}
                                    placeholder="Yorumunuzu yazın..."
                                />
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        disabled={commentMutation.isPending || !commentText.trim()}
                                        onClick={() => commentMutation.mutate({ text: commentText.trim(), parentCommentId: undefined })}
                                    >Gönder</Button>
                                </div>
                            </div>

                            {/* Comments list (top-level then replies) */}
                            <div className="flex flex-col gap-2">
                                {commentsQuery.isLoading && <div className="text-sm text-text-400">Yükleniyor...</div>}
                                {!commentsQuery.isLoading && commentsList.length === 0 && <div className="text-sm text-text-400">Henüz yorum yok.</div>}
                                {commentsList.filter((c: CommentDto) => !c.parentCommentId).map((comment: CommentDto) => (
                                    <Comment
                                        key={comment.id}
                                        comment={comment}
                                        allComments={commentsList}
                                        postId={postDto.id}
                                        queryKey={queryKey}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </Card>
    );
}