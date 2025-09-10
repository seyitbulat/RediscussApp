'use client';

import { Button } from "./ui/button";
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
        // Tasarım İyileştirmesi: Gölge efekti daha yumuşak hale getirildi ve üzerine gelince artan bir animasyon eklendi.
         <Button size="sm" className="absolute right-4 rounded-xl min-w-25 shadow-md hover:shadow-lg transition-shadow"
            onClick={handleClick}
         >
            <BellIcon className="w-5 h-5" />
            Katıl
          </Button>
    );
}
