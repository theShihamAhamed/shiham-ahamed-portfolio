export type SectionNavItem = {
  id: string;
  label: string;
};

export const homeSectionNavigation: SectionNavItem[] = [
  { id: "hero", label: "Intro" },
  { id: "about", label: "Overview" },
  { id: "featured-projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "currently-building", label: "Building" },
  { id: "contact-cta", label: "Contact" },
];

export const aboutSectionNavigation: SectionNavItem[] = [
  { id: "about-hero", label: "About" },
  { id: "about-summary", label: "Summary" },
  { id: "focus-areas", label: "Focus" },
  { id: "education", label: "Education" },
  { id: "certifications", label: "Certifications" },
  { id: "achievements", label: "Achievements" },
  { id: "journey", label: "Journey" },
  { id: "about-contact", label: "Contact" },
];
