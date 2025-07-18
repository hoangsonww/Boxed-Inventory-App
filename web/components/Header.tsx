"use client";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useTheme } from "next-themes";
import { Sun, Moon, LogOut, Box, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const { theme, setTheme } = useTheme();

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-card px-4 py-2 shadow-sm flex items-center justify-between">
      <nav className="flex items-center space-x-4">
        <Link href="/">
          <a className="flex items-center space-x-1">
            <Box className="h-5 w-5" /> <span className="font-bold">Boxed</span>
          </a>
        </Link>
        {session && (
          <>
            <Link href="/boxes/new">
              <a className="flex items-center space-x-1">
                <Tag className="h-5 w-5" /> New Box
              </a>
            </Link>
            <Link href="/profile">
              <a className="flex items-center space-x-1">
                <User className="h-5 w-5" /> Profile
              </a>
            </Link>
          </>
        )}
      </nav>
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>
        {session ? (
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut />
          </Button>
        ) : (
          <Link href="/login">
            <a>
              <Button>Sign In</Button>
            </a>
          </Link>
        )}
      </div>
    </header>
  );
}
