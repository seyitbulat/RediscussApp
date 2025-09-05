import { HomeIcon, MenuIcon } from "lucide-react";
import SidebarSubredisList from "./SidebarSubredisList";
import { getSubscriptions } from "@/lib/sidebar";
import Link from "next/link";
import { Button } from "./ui/button";



export default async function Sidebar() {
    const subscriptions = await getSubscriptions();
    return (
        <div id="sidebar" className="sticky group min-w-60 bg-sidebar -pl-2 pr-2 pt-2 border-r-1 border-r-border flex flex-col z-40">
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

            <Button variant={'default'} size={"icon"} className="absolute top-10 left-full -translate-x-1/2 rounded-full
            ">
                <MenuIcon className="w-6 h-6 p-0.5" />
            </Button>


            <div>
                <SidebarSubredisList initialSubscriptions={subscriptions} />
            </div>
        </div>
    );
}