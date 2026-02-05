import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hideNavbar = router.pathname === "/";

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      const stored = localStorage.getItem("theme");
      if (stored === "light") {
        root.classList.remove("dark");
      } else if (stored === "dark") {
        root.classList.add("dark");
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme();

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      if (!localStorage.getItem("theme")) {
        applyTheme();
      }
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {hideNavbar ? null : <Navbar />}
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
