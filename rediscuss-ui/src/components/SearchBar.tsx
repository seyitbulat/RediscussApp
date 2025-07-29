import { SearchIcon } from "lucide-react";



export default function SearchBar(){
    return (
        <div className="relative group flex">
            <input type="text" placeholder="Ara..." className="bg-white border-white rounded-lg pl-7 w-120 text-text-500 shadow-lg md:w-80 sm:w-40 xl:w-120" />
            <SearchIcon className="absolute w-4 h-4 top-1 left-2 text-primary-50"/>
        </div>
    );
}