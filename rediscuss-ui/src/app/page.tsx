import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import Image from "next/image";

export default function Home() {
  return (
    <AuthGuard>
      <div className="h-screen flex flex-col">
        <Header />

        <div className="main flex w-full flex-grow">
          <div className="w-40 bg-accent-500">
            Sidebar
          </div>

          <main className="flex-grow">
            Content
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
