"use client";

import Head from "next/head";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 – Page Not Found | Boxed</title>
        <meta
          name="description"
          content="The page you’re looking for doesn’t exist or has been moved."
        />
      </Head>

      <main className="flex flex-col items-center justify-center min-h-screen bg-background px-4 text-center">
        <h1 className="text-8xl font-extrabold text-primary">404</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Oops! The page you’re looking for can’t be found.
        </p>
        <Link href="/">
          <Button
            size="lg"
            className="mt-8 group transition hover:-translate-y-[2px] hover:shadow-lg"
          >
            Go back home
            <ArrowRight
              size={18}
              className="ml-2 transition group-hover:translate-x-1"
            />
          </Button>
        </Link>
      </main>
    </>
  );
}
