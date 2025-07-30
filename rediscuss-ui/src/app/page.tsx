import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

export default function Home() {
  return (
    <AuthGuard>
      <div className="h-screen flex flex-col">
        <Header />

        <div className="main flex w-full flex-grow">
          <Sidebar/>

          <main className="flex-grow">
            Content
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
