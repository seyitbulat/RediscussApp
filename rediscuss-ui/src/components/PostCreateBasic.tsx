'use client';
import { ChevronDown, SendIcon } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { setPostAction } from "@/lib/post";



interface PostCreateBasicProps {
    subredisId?: string;
}

export default function PostCreateBasic({ subredisId }: PostCreateBasicProps) {
    const [expanded, setExpanded] = useState(false);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const queryClient = useQueryClient();

    const createPost = useMutation({
        mutationFn: async () => {
            const response = setPostAction(title, content, subredisId || "");
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts', subredisId] });
            setTitle("");
            setContent("");
            setExpanded(false);
        }
    });

    const handleSubmit = async () => {
        createPost.mutate();
    }

    return (
        <Card className="rounded-b-xl rounded-t-none overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-center p-3">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 shadow-inner" />
                    <p className="text-sm font-medium">Yeni gönderi oluştur</p>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setExpanded(v => !v)}
                    aria-expanded={expanded}
                >
                    <ChevronDown className={`w-6 h-6 text-accent-400 transition-transform duration-300 ${!expanded && "rotate-180"}`} />
                </Button>
            </CardHeader>
            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <CardContent className="pt-0 pb-4 px-4">
                        <div className="space-y-2">
                            <Input
                                label="Başlık"
                                value={title}
                                onChange={(e) => setTitle(e.currentTarget.value)}
                            />
                            <div className="flex flex-col space-y-1">
                                <label className="text-sm font-semibold">Gönderi İçeriği</label>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.currentTarget.value)}
                                    placeholder="Gönderi içeriğini buraya yazın..."
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="px-4 pb-4">
                        <Button onClick={handleSubmit} disabled={createPost.isPending} className="gap-2">
                            <SendIcon className="w-5 h-5" />
                            {createPost.isPending ? "Yayınlanıyor..." : "Gönderi Oluştur"}
                        </Button>
                    </CardFooter>
                </div>
            </div>
        </Card>

    );
}