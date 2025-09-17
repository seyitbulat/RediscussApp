"use client";
import { HomeIcon, MenuIcon } from "lucide-react";
import SidebarDiscuitsList from "./SidebarDiscuitsList";
import Link from "next/link";
import { Button } from "./ui/button";
import { DiscuitDto } from "@/types/dto";
import { useSidebar } from "./providers/SidebarContext";
import SidebarToggle from "./SidebarToggle";
import CreateDiscuit from "@/app/(main)/_components/CreateDiscuit";





export default function SidebarClient({ subscriptions, recommendations }: { subscriptions: DiscuitDto[] | null, recommendations: DiscuitDto[] | null }) {
    const { collapsed, toggle } = useSidebar();
    return (
        <div id="sidebar"
            aria-expanded={!collapsed}
            data-collapsed={collapsed}
            className="sticky group w-60 flex-none shrink-0 bg-sidebar -pl-2 pr-2 pt-2 border-r-1 border-r-border flex flex-col z-40 
            transition-[width] duration-300 ease-in-out data-[collapsed=true]:w-16">
            <div className="">
                <ul role="menu">
                    <li role="none">
                        <Button variant={"link"} type="button" role="menuitem" className="w-full flex flex-row">
                            <Link href={'/'} className="w-full flex items-center gap-3 px-3 py-2">
                                <HomeIcon className="w-5 h-5 flex-shrink-0" aria-hidden />
                                <span className="flex-1 text-left truncate">Ana Sayfa</span>
                            </Link>
                        </Button>
                    </li>

                    <li role="none">
                        <div className="my-1 h-px bg-secondary-200" role="separator" />
                    </li>
                </ul>
            </div>

            <div className="absolute top-10 left-full -translate-x-1/2 rounded-full">
                <SidebarToggle />
            </div>



            <div className="mt-4">
                <span className="font-semibold text-lg text-sidebar-accent-foreground pl-2 transition-opacity duration-200 ease-in-out group-data-[collapsed=true]:opacity-0">Öneriler</span>
                <div className="my-1 h-px bg-secondary" role="separator" />
                <SidebarDiscuitsList initialSubscriptions={recommendations} />
            </div>

            <div className="mt-4">
                <span className="font-semibold text-lg text-sidebar-accent-foreground pl-2 transition-opacity duration-200 ease-in-out group-data-[collapsed=true]:opacity-0">Discuits</span>
                <div className="my-1 h-px bg-secondary" role="separator" />

                <div className="m-4">
                    <CreateDiscuit />
                </div>
                <SidebarDiscuitsList initialSubscriptions={subscriptions} />
            </div>
        </div>
    );
}
