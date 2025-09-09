'use client';

import { BellIcon } from "lucide-react";

interface JoinButtonProps{
    subredisId: string
};

export default function JoinButton({subredisId}:JoinButtonProps){
    const handleClick = async () => {
        const response = await fetch(`/api/post/getBySubredis/${subredisId}?page=1&pageSize=5`, {
            method: 'GET'
        });

        const data = await response.json();
    }
    return (
         <button className="absolute inline-flex gap-2 right-4 border border-secondary-200 rounded-xl min-w-25 h-8 items-center p-2 bg-primary-400 text-secondary-50 shadow-lg"
            onClick={handleClick}
         >
            <BellIcon className="w-5 h-5" />
            Katıl
          </button>
    );
}