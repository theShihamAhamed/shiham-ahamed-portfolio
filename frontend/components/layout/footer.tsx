import Link from "next/link";
import { Mail } from "lucide-react";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const socials = [
  {
    label: "Email",
    href: "mailto:theshihamahamed@gmail.com",
    icon: Mail,
    ariaLabel: "Send an email",
  },
  {
    label: "GitHub",
    href: "https://github.com/theShihamAhamed",
    icon: GitHubLogoIcon,
    ariaLabel: "View GitHub profile",
    external: true,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/theshihamahamed/",
    icon: LinkedInLogoIcon,
    ariaLabel: "View LinkedIn profile",
    external: true,
  },
];

const Footer = () => {
  return (
    <footer className="relative border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12 md:items-start">

          {/* Brand */}
          <div className="md:col-span-5">
            <Link
              href="/"
              className="inline-flex items-center text-base font-semibold tracking-[-0.025em] text-foreground transition-opacity hover:opacity-70"
            >
              Shiham Ahamed
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
              Software engineering student building modern web apps,
              scalable backend systems, and thoughtful digital experiences.
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3 md:ml-auto">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Navigation
            </p>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/75 transition-colors duration-150 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Connect
            </p>
            <div className="mt-4 flex items-center gap-2">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    target={social.external ? "_blank" : undefined}
                    rel={social.external ? "noopener noreferrer" : undefined}
                    aria-label={social.ariaLabel}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-border hover:bg-accent hover:text-foreground hover:shadow-md"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Open to internships, collaborations, and software engineering opportunities.
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-2 border-t border-border/50 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground/70">
            © 2026 Shiham Ahamed. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Designed and built with care.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
