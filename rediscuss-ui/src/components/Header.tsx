import { LogOut, Settings, User2, UserIcon } from "lucide-react";
import DropdownButton from "./Static/DropdownButton";
import SearchBar from "./Static/SearchBar";
import { getAuthenticatedUser } from "@/lib/header";
import LogoutButton from "./LogoutButton";


export default async function Header() {
    const user = await getAuthenticatedUser();

    return (
        <div className="sticky top-0 bg-gradient-to-b from-background-500 to-background-500 w-full min-h-13 px-2 items-center flex justify-between border-b-1 border-b-secondary-200 z-50">
            <div className="flex items-center">
                <div className="h-10 w-10 bg-primary-500 rounded-lg text-white inline-flex justify-center items-center shadow shadow-primary-300">
                    <span className="font-bold">R</span>
                </div>
                <span className="text-text-900 text-xl font-bold mx-2">Rediscuss</span>
            </div>
            <SearchBar className="h-8" />
            <DropdownButton label={`/${user?.username}`} iconName={"UserIcon"} className="">
                <ul role="menu" className="list-none m-0 p-1 min-w-48">
                    <li role="none">
                        <button
                            type="button"
                            role="menuitem"
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
                   hover:bg-secondary-50 focus:bg-secondary-100 outline-none"
                        >
                            <User2 className="w-5 h-5 flex-shrink-0" aria-hidden />
                            <span className="flex-1 text-left truncate">Profil</span>
                        </button>
                    </li>

                    <li role="none">
                        <div className="my-1 h-px bg-secondary-200" role="separator" />
                    </li>

                    <li role="none">
                        <button
                            type="button"
                            role="menuitem"
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
                   hover:bg-secondary-50 focus:bg-secondary-100 outline-none"
                        >
                            <Settings className="w-5 h-5 flex-shrink-0" aria-hidden />
                            <span className="flex-1 text-left truncate">Ayarlar</span>
                        </button>
                    </li>

                    <li role="none">
                        <LogoutButton />
                    </li>
                </ul>
            </DropdownButton>
        </div >
    );
}