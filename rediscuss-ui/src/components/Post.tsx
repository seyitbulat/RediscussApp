'use client';
import { PostDto } from "@/types/dto";
import { ArrowBigDown, ArrowBigUp, BadgeCheck, LucideCookie, MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale";

export interface PostProps {
    postDto: PostDto
}


export default function Post({ postDto }: PostProps) {


    const relativeDate = formatDistanceToNow(postDto.createdAt, { addSuffix: true, locale: tr }).replace("yaklaşık", "")
    return (
        <article
            className="group overflow-hidden"
        >
            <div className="flex-1 p-4">
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

                <h2 className="mt-3 font-semibold leading-tigh">{postDto.title}</h2>
                <p className="line-clamp-3 mt-2">{postDto.content}</p>

                <footer className="flex mt-4">
                    <div className="flex h-9 gap-2 justify-between items-center border rounded-xl shadow border-secondary-200">
                        <button type="button"
                            className="group/upVote relative w-8 h-8 rounded-full flex justify-center items-center transition-all ml-2
                            hover:bg-secondary-200
                        "
                        >
                            <LucideCookie className="w-5 h-5 group-hover/upVote:text-primary-400 transition-all" />

                            <ArrowBigUp
                                className="absolute -top-1 -right-1 w-4 h-4 text-primary-400 transition-all opacity-0 translate-y-5
                                group-hover/upVote:opacity-100
                                group-hover/upVote:translate-y-0
                                "
                            />
                        </button>

                        <span className="text-sm flex">{postDto.upVotes + postDto.downVotes}</span>
                        <button
                            type="button"
                            className="group/downVote relative w-8 h-8 rounded-full flex justify-center items-center transition-all me-2 hover:bg-secondary-200"
                        >
                            <LucideCookie className="w-5 h-5 group-hover/downVote:text-accent-400 transition-all" />

                            <ArrowBigDown
                                className="absolute -top-1 -right-1 w-4 h-4 text-accent-400 transition-all opacity-0 translate-y-0
                                group-hover/downVote:opacity-100
                                group-hover/downVote:translate-y-5
                                "
                            />
                        </button>
                    </div>
                </footer>
            </div>
        </article>
    );

    return (
        <div className={`min-h-40 transition-all p-4`} >
            <div className="flex gap-4 items-center">
                <span>{postDto.createdByUserName}</span>
                <div className="text-xs align-text-bottom">44m ago</div>
            </div>
            <div className={`min-h-10`}>{postDto.title}</div>
            <div className="min-h-20">{postDto.content}</div>
            <div className="w-full flex">
                <div className="flex gap-4 items-center border rounded-xl shadow border-secondary-200">
                    <button type="button" className="peer relative align-text-bottom w-6 h-6 rounded-full peer
                    ">
                        <LucideCookie className="text-primary w-5 h-5" />
                        <PlusIcon className="absolute w-3 h-3 -top-0 -right-1 text-green-900" />

                    </button>
                    <span className="text-sm">230</span>
                    <button className="relative align-text-bottom w-6 h-6">
                        <LucideCookie className="text-accent w-5 h-5 rotate-180" />
                        <MinusIcon className="absolute w-2.5 h-3 -bottom-0 -left-1 text-red-900" />

                    </button>
                </div>
            </div>
        </div>
    );
}