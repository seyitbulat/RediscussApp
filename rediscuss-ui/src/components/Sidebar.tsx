import { HomeIcon, MenuIcon } from "lucide-react";
import SidebarSubredisList from "./SidebarSubredisList";
import { getRecommendedSubredises, getSubscriptions } from "@/lib/sidebar";
import Link from "next/link";
import { Button } from "./ui/button";
import SidebarClient from "./Sidebar.Client";



export default async function Sidebar() {
    const subscriptions = await getSubscriptions();
    const recommendations = await getRecommendedSubredises();
    return (
       <SidebarClient subscriptions={subscriptions} recommendations={recommendations}>

       </SidebarClient>
    );
}