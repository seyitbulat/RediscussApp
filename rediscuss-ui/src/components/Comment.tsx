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
            <div className="rounded-md border p-3 bg-surface/50">
                <div className="text-sm font-medium">{comment.createdByUsername}</div>
                <div className="text-sm text-text-500 mt-1">{comment.content}</div>
                <div className="text-xs text-text-300 mt-1">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: tr }).replace("yaklaşık", "")}
                </div>
                <div className="mt-2 flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}>
                        Yanıtla
                    </Button>
                </div>

                {replyToId === comment.id && (
                    <div className="mt-2">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full rounded-md border p-2 text-sm"
                            rows={2}
                            placeholder="Yanıtınızı yazın..."
                        />
                        <div className="flex gap-2 justify-end mt-1">
                            <Button size="sm" variant="ghost" onClick={() => { setReplyToId(null); setReplyText(""); }}>İptal</Button>
                            <Button
                                size="sm"
                                disabled={commentMutation.isPending || !replyText.trim()}
                                onClick={handleReply}
                            >
                                Gönder
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {replies.length > 0 && (
                <div className="pl-6 flex flex-col gap-2">
                    {replies.map(reply => (
                        <Comment key={reply.id} comment={reply} allComments={allComments} postId={postId} queryKey={queryKey} />
                    ))}
                </div>
            )}
        </div>
    );
}
