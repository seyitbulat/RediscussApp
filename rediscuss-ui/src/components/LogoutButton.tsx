'use client';
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";



export default function LogoutButton() {
    const router = useRouter();
    
    const handleOnClick = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST'
            });

            if(response.ok){
                router.push('/login');
            }
        } catch (error) {
            
        }
    };
    return (
        <button
            type="button"
            role="menuitem"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
                   text-red-600 hover:bg-red-50 focus:bg-red-50 outline-none"
            onClick={handleOnClick}
        >
            <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden />
            <span className="flex-1 text-left truncate">Çıkış Yap</span>
        </button>
    );
}