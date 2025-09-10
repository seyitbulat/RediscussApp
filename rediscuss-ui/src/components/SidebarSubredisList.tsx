'use client';
import { SubredisDto } from "@/types/dto";
import Link from "next/link"
import { Button } from "./ui/button";
import { CircleArrowRight } from "lucide-react";
import { useSidebar } from "./providers/SidebarContext";
interface SidebarSubredisListProps {
    initialSubscriptions: SubredisDto[] | null
}



export default function SidebarSubredisList({ initialSubscriptions }: SidebarSubredisListProps) {
    const {collapsed} = useSidebar();
    
    if (!initialSubscriptions) {
        return null;
    }

    if (initialSubscriptions.length === 0) {
        return <p className="text-sm text-card-foreground mt-4">Henüz aboneliğiniz yok.</p>;
    }

    return (
        <div>
            <ul role="menu">
                {initialSubscriptions.map(subredis => (
                    <li key={subredis.id} role="none">
                         <Button variant={"link"} type="button" role="menuitem" className="w-full flex flex-row">
                            <Link href={`/d/${subredis.name}`} className="w-full flex items-center gap-3 px-3 py-2">
                                <CircleArrowRight className="w-5 h-5 flex-shrink-0" aria-hidden />
                                <span className={`flex-1 text-left truncate transition-opacity duration-200 ease-in-out group-data-[collapsed=true]:opacity-0`}>
                                    {subredis.name}
                                </span>
                            </Link>
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
