'use client';
import { logout } from "@/lib/actions/auth";
import { LogOut } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";


const LogoutButton = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => {

    const handleOnClick = async () => {
        logout();
    };
    return (
        <Button
            variant="ghost"
            ref={ref}
            onClick={handleOnClick}
            className={cn("w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50", className)}
            {...props}
        >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Çıkış Yap</span>
        </Button>
    );
});
LogoutButton.displayName = "LogoutButton";

export default LogoutButton;