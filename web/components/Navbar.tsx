"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

import {
  Boxes,
  LogIn,
  LogOut,
  User,
  LayoutDashboard,
  Settings,
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const avatarEl = (
    <Button
      variant="outline"
      size="icon"
      aria-label="Account menu"
      className="relative"
    >
      {session?.user.user_metadata?.avatar_url ? (
        <img
          src={session.user.user_metadata.avatar_url}
          alt="Your avatar"
          className="h-6 w-6 rounded-full object-cover"
        />
      ) : (
        <User size={18} />
      )}
    </Button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <nav
        className="
          mx-auto w-full
          max-w-screen-2xl
          px-3 sm:px-4
          py-2.5
          flex items-center gap-2
        "
      >
        {/* Left: Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg sm:text-xl font-semibold shrink-0"
        >
          <Boxes size={24} className="text-primary" />
          <span>Boxed</span>
        </Link>

        {/* Spacer grows */}
        <div className="flex-1" />

        {/* Desktop actions (>= md) */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {session ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="secondary"
                  size="sm"
                  className="hover:bg-secondary/80"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>{avatarEl}</DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      signOut();
                    }}
                    className="font-semibold text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <Settings className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">
                <LogIn size={16} />
                Sign in
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile actions (< md) */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />

          {/* One compact dropdown that holds everything */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open menu"
                className="shrink-0"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-52">
              {session ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <Settings className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      signOut();
                    }}
                    className="font-semibold text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/login" className="flex items-center">
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
