"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Theme from "./theme-toggle";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const MobileNavbar = () => {
  const pathname = usePathname();

  return (
    <div className="flex w-full items-center justify-between lg:hidden">
      <Link
        href="/"
        className="group inline-flex items-center rounded-xl p-1.5 transition-all duration-200 ease-out hover:opacity-80"
      >
        <Image
          src="/logo.svg"
          alt="Shiham logo"
          width={26}
          height={26}
          className="shrink-0 invert transition-transform duration-200 ease-out group-hover:scale-105 dark:invert-0"
        />
      </Link>

      <div className="flex items-center gap-2">
        <Theme />

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-border/70 bg-transparent text-foreground shadow-none hover:bg-accent"
            >
              <Menu className="h-4.5 w-4.5" />
              <span className="sr-only">Open navigation menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[82vw] max-w-[320px] border-l border-border/60 bg-background text-foreground backdrop-blur-xl"
          >
            <SheetHeader className="border-b border-border/50 pb-4">
              <SheetTitle className="flex items-center gap-2.5 text-left text-sm font-medium text-foreground">
                <Image
                  src="/logo.svg"
                  alt="Shiham logo"
                  width={22}
                  height={22}
                  className="shrink-0 invert dark:invert-0"
                />
                Navigation
              </SheetTitle>
            </SheetHeader>

            <div className="mt-5 flex h-full flex-col justify-between">
              <nav>
                <ul className="flex flex-col gap-0.5">
                  {navLinks.map((link) => {
                    const isActive =
                      link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                    return (
                      <li key={link.label}>
                        <SheetClose asChild>
                          <Link
                            href={link.href}
                            scroll
                            className={cn(
                              "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out",
                              isActive
                                ? "bg-accent text-foreground"
                                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                            )}
                          >
                            {link.label}
                          </Link>
                        </SheetClose>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-6 flex flex-col gap-2 px-1 pb-8">
                <Button
                  asChild
                  variant="outline"
                  className="h-10 w-full justify-start rounded-lg border-border/70 bg-transparent text-foreground shadow-none hover:bg-accent hover:text-foreground"
                >
                  <Link href="https://github.com/theShihamAhamed" target="_blank" rel="noopener noreferrer">
                    <GitHubLogoIcon className="mr-2 h-4 w-4" />
                    GitHub
                  </Link>
                </Button>

                <Button
                  asChild
                  className="h-10 w-full justify-start rounded-lg bg-foreground text-background shadow-sm hover:opacity-90"
                >
                  <Link href="https://www.linkedin.com/in/theshihamahamed/" target="_blank" rel="noopener noreferrer">
                    <LinkedInLogoIcon className="mr-2 h-4 w-4" />
                    LinkedIn
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MobileNavbar;
