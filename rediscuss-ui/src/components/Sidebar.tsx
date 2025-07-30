import { MenuIcon } from "lucide-react";



export default function Sidebar() {
    return (
        <div id="sidebar" className="relative group w-60 bg-secondary-100 pl-2 pt-2 border-r-1 border-r-secondary-200 flex">
            <div className="">
                Sidebar
            </div>

            <button className="absolute top-10 left-full -translate-x-1/2 rounded-full border border-secondary-300 bg-secondary-100 text-text-400
                hover:bg-secondary-200 focus:bg-secondary-300
            ">
                <MenuIcon className="w-6 h-6 p-0.5" />
            </button>
        </div>
    );
}