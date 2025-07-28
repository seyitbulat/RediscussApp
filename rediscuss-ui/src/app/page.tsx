import AuthGuard from "@/components/AuthGuard";
import Image from "next/image";

export default function Home() {
  return (
    <AuthGuard>
      Hehe
    </AuthGuard>
  );
}
