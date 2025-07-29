import SearchBar from "./SearchBar";


export default function Header() {
    return (
        <div className="sticky top-0 bg-gradient-to-b from-primary-500 to-primary-500 text-primary-50 w-full h-10 shadow px-2 items-center flex justify-between">
            <span className="text-primary-50 text-xl">Rediscuss</span>
            <SearchBar />
            <div className="justify-center">User</div>
        </div>
    );
}