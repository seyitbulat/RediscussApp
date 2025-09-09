import { HomeIcon, MenuIcon } from "lucide-react";
import SidebarSubredisList from "./SidebarSubredisList";
import { getSubscriptions } from "@/lib/sidebar";
import Link from "next/link";
import { Button } from "./ui/button";
import SidebarClient from "./Sidebar.Client";



export default async function Sidebar() {
    const subscriptions = await getSubscriptions();
    return (
       <SidebarClient subscriptions={subscriptions}>

       </SidebarClient>
    );
}