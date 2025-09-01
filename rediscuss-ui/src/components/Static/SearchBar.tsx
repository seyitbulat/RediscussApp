import { SearchIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface SearchBarProps{
    className?: string
}

export default function SearchBar({className } : SearchBarProps){
    return (
        <div className="relative group flex">
            <input type="text" placeholder="Ara..." className={twMerge("border-white rounded-lg pl-7 w-120 text-text-500 shadow-lg md:w-80 sm:w-40 xl:w-120 bg-background-600", className)} />
            <SearchIcon className="absolute w-4 h-4 top-1/2 -translate-y-1/2 left-2 text-primary-50"/>
        </div>
    );
}