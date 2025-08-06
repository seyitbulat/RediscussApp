'use client';
import { PostDto } from "@/types/dto";
import { LucideCookie, MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";


export interface PostProps{
    postDto: PostDto
}


export default function Post({postDto} : PostProps) {
    const [isMouseEnter, SetIsMouseEnter] = useState(false);


    return (
        <div className={`min-h-40 transition-all p-4  ${isMouseEnter ? "" : ""}`} onMouseEnter={() => SetIsMouseEnter(true)} onMouseLeave={() => SetIsMouseEnter(false)}>
            <div className="flex gap-4 items-center">
                <div className="">{postDto.createByUserName}</div>
                <div className="text-xs align-text-bottom">44m ago</div>
            </div>
            <div className={`min-h-10 ${isMouseEnter ? "text-primary transition-colors" : ""}`}>{postDto.title}</div>
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