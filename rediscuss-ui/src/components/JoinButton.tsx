'use client';

import { followDiscuit } from "@/lib/post";
import { Button } from "./ui/button";
import { BellIcon } from "lucide-react";

interface JoinButtonProps{
    discuitId: string
};

export default function JoinButton({discuitId}:JoinButtonProps){
    const handleJoin = async () => {
        followDiscuit(discuitId);
    }

    return (
         <Button size="sm" className="absolute right-4 rounded-xl min-w-25 shadow-md hover:shadow-lg transition-shadow"
            onClick={handleJoin}
         >
            <BellIcon className="w-5 h-5" />
            Katıl
          </Button>
    );
}
