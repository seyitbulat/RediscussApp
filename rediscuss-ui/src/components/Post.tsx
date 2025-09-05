'use client';
import { PostDto } from "@/types/dto";
import { ArrowBigDown, ArrowBigUp, BadgeCheck, LucideCookie, MinusIcon, PlusIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

export interface PostProps {
    postDto: PostDto
}


export default function Post({ postDto }: PostProps) {


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
                                <span className="font-medium">{postDto.createdByUserName}</span>
                                <BadgeCheck className="h-4 w-4 text-primary-500" />
                                <span>•</span>
                                <span>{postDto.subredisName}</span>
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
                            >
                                <LucideCookie className="w-5 h-5 group-hover/upVote:text-primary-400 transition-all" />

                                <ArrowBigUp
                                    className="absolute -top-1 -right-1 w-4 h-4 text-primary-400 transition-all opacity-0 translate-y-5
                                    group-hover/upVote:opacity-100
                                    group-hover/upVote:translate-y-0
                                    "
                                />
                            </Button>

                            <span className="text-sm flex">{postDto.upVotes + postDto.downVotes}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"                                
                                className="group/downVote relative h-8 w-8 rounded-full"
                            >
                                <LucideCookie className="w-5 h-5 group-hover/downVote:text-accent-400 transition-all" />

                                <ArrowBigDown
                                    className="absolute -top-1 -right-1 w-4 h-4 text-accent-400 transition-all opacity-0 translate-y-0
                                    group-hover/downVote:opacity-100
                                    group-hover/downVote:translate-y-5
                                    "
                                />
                            </Button>
                        </div>
                    </footer>
                </div>
            </article>
        </Card>
    );
}
