import { MenuIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useSidebar } from "./providers/SidebarContext";


export default function SidebarToggle(){
    const {collapsed, toggle} = useSidebar();


    return(
         <Button variant={'default'} size={"icon"} className="absolute top-10 left-full -translate-x-1/2 rounded-full
            " onClick={toggle}>
                <MenuIcon className="w-6 h-6 p-0.5" />
            </Button>
    );
}