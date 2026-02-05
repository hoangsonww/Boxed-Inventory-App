import { ReactNode } from "react";
import { useRouter } from "next/router";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hideNavbar = router.pathname === "/";
  return (
    <div className="flex min-h-screen flex-col">
      {hideNavbar ? null : <Navbar />}
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
