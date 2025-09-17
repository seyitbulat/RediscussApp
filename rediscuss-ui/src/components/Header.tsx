import { LogOut, Settings, User2, UserIcon } from "lucide-react";
import SearchBar from "./Static/SearchBar";
import { getAuthenticatedUser } from "@/lib/header";
import LogoutButton from "./LogoutButton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { logout } from "@/lib/actions/auth";

export default async function Header() {
    const user = await getAuthenticatedUser();

    return (
        <header className="sticky top-0 bg-background w-full min-h-14 px-4 flex items-center justify-between border-b border-border z-50">
            {/* Sol Bölüm - Logo */}
            <div className="flex items-center justify-start flex-1">
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-primary rounded-lg text-primary-foreground inline-flex justify-center items-center shadow shadow-primary-300">
                        <span className="font-bold">R</span>
                    </div>
                    <span className="text-secondary-foreground text-xl font-bold hidden sm:inline-block">Rediscuss</span>
                </Link>
            </div>

            {/* Orta Bölüm - Arama Çubuğu */}
            <div className="flex items-center justify-center flex-auto">
                <SearchBar className="h-9 w-full max-w-lg" />
            </div>

            {/* Sağ Bölüm - Kullanıcı Menüsü */}
            <div className="flex items-center justify-end flex-1">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2 px-3">
                            <UserIcon className="h-5 w-5" />
                            <span className="hidden md:inline-block">{user?.username}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User2 className="mr-2 h-4 w-4" />
                            <span>Profil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Ayarlar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <form action={logout} className="w-full">
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-start px-2 py-1.5 text-red-600 hover:text-red-700"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Çıkış Yap</span>
                                </button>
                            </form>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
