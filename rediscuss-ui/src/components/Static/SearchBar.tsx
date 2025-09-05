import { SearchIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Input } from "@/components/ui/input";

interface SearchBarProps{
    className?: string
}

export default function SearchBar({className } : SearchBarProps){
    return (
        <div className="relative group flex">
            <Input type="text" placeholder="Ara..." className={twMerge("pl-7 w-120 text-text-500 shadow-lg md:w-80 sm:w-40 xl:w-120", className)} />
            <SearchIcon className="absolute w-4 h-4 top-1/2 -translate-y-1/2 left-2 text-primary-50"/>
        </div>
    );
}
