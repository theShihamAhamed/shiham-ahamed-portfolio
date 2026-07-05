import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";

import {
  SectionReveal,
} from "@/components/motion/motion-primitives";
import { Button } from "@/components/ui/button";

const ContactCTASection = () => {
  return (
    <section
      id="contact-cta"
      className="relative scroll-mt-24 py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/80 px-6 py-10 shadow-sm backdrop-blur-xl sm:px-10 sm:py-12 lg:px-14 lg:py-16">

          {/* Subtle bg glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.08),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.06),transparent_45%)]" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:items-center">

            {/* Left: Copy */}
            <div className="lg:col-span-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Contact
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-foreground sm:text-4xl lg:text-[2.5rem] lg:leading-[1.1]">
                Open to opportunities,
                <span className="block text-muted-foreground">
                  collaborations, and meaningful work.
                </span>
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground sm:text-[0.95rem] sm:leading-8">
                If you&apos;d like to discuss internships, software engineering
                opportunities, project collaboration, or simply connect, I&apos;d be
                happy to hear from you.
              </p>

              <p className="mt-5 text-sm font-medium text-foreground/90">
                Currently open to internships, learning opportunities, and
                software development collaborations.
              </p>
            </div>

            {/* Right: Action card */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-border/60 bg-background/60 p-5 shadow-sm backdrop-blur-md sm:p-6">
                <div className="flex flex-col gap-2.5">
                  <Button
                    asChild
                    className="h-11 w-full justify-start rounded-xl bg-foreground px-5 text-sm text-background shadow-sm transition-all duration-200 ease-out hover:-translate-y-px hover:opacity-90 hover:shadow-md"
                  >
                    <Link href="mailto:theshihamahamed@gmail.com">
                      <Mail className="mr-2 h-4 w-4" />
                      Email Me
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-11 w-full justify-start rounded-xl border-border/70 bg-transparent px-5 text-sm text-foreground shadow-none transition-all duration-200 ease-out hover:-translate-y-px hover:border-border hover:bg-accent"
                  >
                    <Link
                      href="https://www.linkedin.com/in/theshihamahamed/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LinkedInLogoIcon className="mr-2 h-4 w-4" />
                      Connect on LinkedIn
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-11 w-full justify-start rounded-xl border-border/70 bg-transparent px-5 text-sm text-foreground shadow-none transition-all duration-200 ease-out hover:-translate-y-px hover:border-border hover:bg-accent"
                  >
                    <Link
                      href="https://github.com/theShihamAhamed"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GitHubLogoIcon className="mr-2 h-4 w-4" />
                      View GitHub
                    </Link>
                  </Button>
                </div>

                <div className="mt-5 border-t border-border/50 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Preferred contact
                      </p>
                      <p className="mt-1.5 text-sm font-medium text-foreground">
                        Email or LinkedIn
                      </p>
                    </div>

                    <Link
                      href="/contact"
                      className="inline-flex items-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Full contact page
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </SectionReveal>
      </div>
    </section>
  );
};

export default ContactCTASection;
