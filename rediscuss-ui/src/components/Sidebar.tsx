import { HomeIcon, MenuIcon } from "lucide-react";
import SidebarSubredisList from "./SidebarSubredisList";
import { getSubscriptions } from "@/lib/sidebar";
import Link from "next/link";



export default async function Sidebar() {
    const subscriptions = await getSubscriptions();
    return (
        <div id="sidebar" className="relative group w-60 bg-secondary-100 pl-2 pr-2 pt-2 border-r-1 border-r-secondary-200 flex flex-col">
            <div className="">
                <ul role="menu">
                    <li role="none">
                        {/* <button
                            type="button"
                            role="menuitem"
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
                   hover:bg-secondary-50 focus:bg-secondary-100 outline-none"
                        >
                            <HomeIcon className="w-5 h-5 flex-shrink-0" aria-hidden />
                            <span className="flex-1 text-left truncate">Ana Sayfa</span>
                        </button> */}

                        <Link href={'/'}>
                            Ana Sayfa
                        </Link>
                    </li>

                    <li role="none">
                        <div className="my-1 h-px bg-secondary-200" role="separator" />
                    </li>
                </ul>
            </div>

            <button className="absolute top-10 left-full -translate-x-1/2 rounded-full border border-secondary-300 bg-secondary-100 text-text-400
                hover:bg-secondary-200 focus:bg-secondary-300
            ">
                <MenuIcon className="w-6 h-6 p-0.5" />
            </button>


            <div>
                <SidebarSubredisList initialSubscriptions={subscriptions} />
            </div>
        </div>
    );
}