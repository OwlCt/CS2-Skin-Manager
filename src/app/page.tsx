import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Button size="lg" asChild>
        <Link href="/api/auth/steam">Login with Steam</Link>
      </Button>
    </div>
  );
}
