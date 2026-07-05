import { Mail } from "lucide-react";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";

import {
  AnimatedPageHeader,
  SectionReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/motion-primitives";
import ContactMethodCard from "@/components/sections/contact/contact-method-card";
import ContactForm from "@/components/sections/contact/contact-form";
import CopyEmail from "@/components/sections/contact/copy-email";
import { getSiteSettingsFromMongo } from "@/lib/server/public-data/site-settings";

export const revalidate = 3600;

const fallbackContactProfile = {
  email: "theshihamahamed@gmail.com",
  githubUrl: "https://github.com/theShihamAhamed",
  linkedinUrl: "https://www.linkedin.com/in/theshihamahamed/",
};

const formatContactUrl = (url: string) =>
  url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");

const getContactProfile = async () => {
  try {
    const settings = await getSiteSettingsFromMongo();

    if (!settings) {
      return fallbackContactProfile;
    }

    return {
      email: settings.email,
      githubUrl: settings.githubUrl,
      linkedinUrl: settings.linkedinUrl,
    };
  } catch (error) {
    console.error("Failed to load contact settings", error);

    return fallbackContactProfile;
  }
};

export default async function ContactPage() {
  const profile = await getContactProfile();

  const contactMethods = [
    {
      id: "email",
      title: "Email",
      value: profile.email,
      href: `mailto:${profile.email}`,
      icon: Mail,
      action: "Email me",
    },
    {
      id: "linkedin",
      title: "LinkedIn",
      value: formatContactUrl(profile.linkedinUrl),
      href: profile.linkedinUrl,
      icon: LinkedInLogoIcon,
      action: "Open profile",
    },
    {
      id: "github",
      title: "GitHub",
      value: formatContactUrl(profile.githubUrl),
      href: profile.githubUrl,
      icon: GitHubLogoIcon,
      action: "View projects",
    },
  ];

  return (
    <div className="relative overflow-hidden bg-background pb-20 sm:pb-24 lg:pb-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(59,130,246,0.10),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(16,185,129,0.08),transparent_30%),linear-gradient(to_bottom,transparent,rgba(120,120,120,0.04)_48%,transparent)] dark:bg-[radial-gradient(circle_at_12%_12%,rgba(96,165,250,0.12),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(45,212,191,0.10),transparent_30%),linear-gradient(to_bottom,transparent,rgba(255,255,255,0.035)_48%,transparent)]" />

      <section className="relative border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <AnimatedPageHeader className="max-w-4xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Contact
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-[-0.055em] text-foreground sm:text-5xl lg:text-6xl">
              Let&rsquo;s discuss opportunities and practical software work.
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
              Reach out for internship opportunities, project discussions, or
              software engineering roles. I&rsquo;ll respond through email when
              possible.
            </p>
          </AnimatedPageHeader>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          <StaggerContainer
            className="space-y-4 lg:col-span-5"
            staggerChildren={0.035}
          >
            {contactMethods.map((method) => (
              <StaggerItem key={method.id}>
                <ContactMethodCard
                  title={method.title}
                  value={method.value}
                  href={method.href}
                  action={method.action}
                  icon={method.icon}
                  secondaryAction={
                    method.id === "email" ? (
                      <CopyEmail email={profile.email} variant="compact" />
                    ) : undefined
                  }
                />
              </StaggerItem>
            ))}
          </StaggerContainer>

          <div className="lg:col-span-7">
            <SectionReveal
              className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/60 p-5 shadow-sm backdrop-blur-xl sm:p-7"
              distance={6}
              delay={0.08}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent opacity-80" />
              <div className="max-w-2xl">
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                  Tell me about the opportunity
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Share a few details about the role, or collaboration. The
                  message will be sent directly to my inbox.
                </p>
              </div>

              <ContactForm />
            </SectionReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
