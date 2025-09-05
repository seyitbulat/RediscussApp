import { getSubscriptions } from "@/lib/sidebar";
import { SubredisDto } from "@/types/dto";
import Link from "next/link"
interface SidebarSubredisListProps {
    initialSubscriptions: SubredisDto[] | null
}



export default async function SidebarSubredisList({ initialSubscriptions }: SidebarSubredisListProps) {
    if (!initialSubscriptions) {
        return null;
    }

    if (initialSubscriptions.length === 0) {
        return <p className="text-sm text-card-foreground mt-4">Henüz aboneliğiniz yok.</p>;
    }

    return (
        <div>
            <ul>
                {initialSubscriptions.map(subredis => (
                    <li key={subredis.id}>
                        <Link href={`/d/${subredis.name}`}>
                            {subredis.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}