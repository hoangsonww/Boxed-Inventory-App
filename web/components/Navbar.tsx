import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Boxes, LogIn, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <nav className="container mx-auto flex items-center justify-between py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-semibold"
        >
          <Boxes size={24} className="text-primary" />
          Boxed
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session ? (
            <>
              <Link href="/dashboard">
                <Button variant="secondary" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                size="icon"
                onClick={signOut}
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">
                <LogIn size={16} className="mr-2" />
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
