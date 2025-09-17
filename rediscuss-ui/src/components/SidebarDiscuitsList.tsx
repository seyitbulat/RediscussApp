'use client';
import { DiscuitDto } from "@/types/dto";
import Link from "next/link"
import { Button } from "./ui/button";
import { CircleArrowRight } from "lucide-react";
import { useSidebar } from "./providers/SidebarContext";
interface SidebarDiscuitsListProps {
    initialSubscriptions: DiscuitDto[] | null
}



export default function SidebarDiscuitsList({ initialSubscriptions }: SidebarDiscuitsListProps) {
    const {collapsed} = useSidebar();
    
    if (!initialSubscriptions) {
        return null;
    }

    

    return (
        <div>
            <ul role="menu">
                {initialSubscriptions.map(discuit => (
                    <li key={discuit.id} role="none">
                         <Button variant={"link"} type="button" role="menuitem" className="w-full flex flex-row">
                            <Link href={`/d/${discuit.name}`} className="w-full flex items-center gap-3 px-3 py-2">
                                <CircleArrowRight className="w-5 h-5 flex-shrink-0" aria-hidden />
                                <span className={`flex-1 text-left truncate transition-opacity duration-200 ease-in-out group-data-[collapsed=true]:opacity-0`}>
                                    {discuit.name}
                                </span>
                            </Link>
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
    );
}