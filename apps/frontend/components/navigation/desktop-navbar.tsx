"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Theme from "./theme-toggle";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const DesktopNavbar = () => {
  const pathname = usePathname();

  return (
    <div className="hidden w-full items-center lg:grid lg:grid-cols-3">
      {/* LEFT - Logo */}
      <div className="flex items-center">
        <Link
          href="/"
          className="group inline-flex items-center rounded-xl p-1.5 transition-all duration-200 ease-out hover:opacity-80"
        >
          <Image
            src="/logo.svg"
            alt="Shiham logo"
            width={26}
            height={26}
            className="invert dark:invert-0 shrink-0 transition-transform duration-200 ease-out group-hover:scale-105"
          />
        </Link>
      </div>

      {/* CENTER - Nav links */}
      <nav className="flex justify-center">
        <ul className="flex items-center gap-0.5">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  scroll
                  className={cn(
                    "inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ease-out",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* RIGHT - Actions */}
      <div className="flex items-center justify-end gap-1.5">
        <Theme />
        <Separator orientation="vertical" className="mx-1 h-5 opacity-40" />
        <Button
          asChild
          variant="outline"
          className="h-9 rounded-lg border-border/70 bg-transparent px-3.5 text-sm text-foreground shadow-none transition-all duration-200 hover:-translate-y-px hover:border-border hover:bg-accent "
        >
          <Link
            href="https://github.com/theShihamAhamed"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubLogoIcon className="mr-1.5 h-4 w-4" />
            GitHub
          </Link>
        </Button>
        <Button
          asChild
          className="h-9 rounded-lg bg-foreground px-3.5 text-sm text-background shadow-sm transition-all duration-200 hover:-translate-y-px hover:opacity-90"
        >
          <Link
            href="https://www.linkedin.com/in/theshihamahamed/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInLogoIcon className="mr-1.5 h-4 w-4" />
            LinkedIn
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default DesktopNavbar;
