'use client';

import { CommentDto } from "@/types/dto";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "./ui/button";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setPostComment } from "@/lib/post";

interface CommentProps {
    comment: CommentDto;
    allComments: CommentDto[];
    postId: string;
    queryKey: string[];
}

export default function Comment({ comment, allComments, postId, queryKey }: CommentProps) {
    const queryClient = useQueryClient();
    const [replyToId, setReplyToId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");

    const replies = allComments.filter(c => c.parentCommentId === comment.id);

    const commentMutation = useMutation({
        mutationFn: async (payload: { text: string; parentCommentId?: string | null }) => {
            return await setPostComment(postId, payload.text, payload.parentCommentId);
        },
        onSuccess: () => {
            setReplyText("");
            setReplyToId(null);
            queryClient.invalidateQueries({ queryKey: queryKey });
            queryClient.invalidateQueries({ queryKey: ["postComments", postId] });
        }
    });

    const handleReply = () => {
        if (!replyText.trim()) return;
        commentMutation.mutate({ text: replyText.trim(), parentCommentId: comment.id });
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="group rounded-lg border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm">
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm" />
                    
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">
                                {comment.CreatedByUsername}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: tr }).replace("yaklaşık", "")}
                            </span>
                        </div>
                        
                        {/* Content */}
                        <p className="mt-2 text-sm text-foreground/90 leading-relaxed">
                            {comment.content}
                        </p>
                        
                        {/* Actions */}
                        <div className="mt-3 flex items-center gap-1">
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 px-2 text-xs hover:bg-primary/10 hover:text-primary"
                                onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                            >
                                {replyToId === comment.id ? "İptal" : "Yanıtla"}
                            </Button>
                        </div>

                        {/* Reply Form */}
                        {replyToId === comment.id && (
                            <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    rows={2}
                                    placeholder="Yanıtınızı yazın..."
                                    autoFocus
                                />
                                <div className="flex gap-2 justify-end">
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-8"
                                        onClick={() => { setReplyToId(null); setReplyText(""); }}
                                    >
                                        İptal
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="h-8"
                                        disabled={commentMutation.isPending || !replyText.trim()}
                                        onClick={handleReply}
                                    >
                                        {commentMutation.isPending ? "Gönderiliyor..." : "Gönder"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Nested Replies */}
            {replies.length > 0 && (
                <div className="ml-8 flex flex-col gap-2 border-l-2 border-border/50 pl-4">
                    {replies.map(reply => (
                        <Comment key={reply.id} comment={reply} allComments={allComments} postId={postId} queryKey={queryKey} />
                    ))}
                </div>
            )}
        </div>
    );
}
