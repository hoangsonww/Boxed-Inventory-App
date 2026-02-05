import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border bg-background/70 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        {/* Credit */}
        <p className="text-center text-sm text-muted-foreground">
          © {year} Boxed. Made with <span className="text-red-500">♥</span> by{" "}
          <Link
            href="https://sonnguyenhoang.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:text-primary hover:underline transition underline"
          >
            Son Nguyen
          </Link>
          .
        </p>

        {/* Social Icons */}
        <div className="flex items-center gap-6">
          <Link
            href="https://github.com/hoangsonww"
            target="_blank"
            rel="noopener noreferrer"
            className="group text-muted-foreground transition"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5 group-hover:text-primary transition-colors" />
          </Link>
          <Link
            href="https://linkedin.com/in/hoangsonw"
            target="_blank"
            rel="noopener noreferrer"
            className="group text-muted-foreground transition"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5 group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
