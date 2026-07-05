import { AboutStat, FocusArea, TimelineItem } from "@/types/about";

export const aboutIntro = {
  label: "About me",
  title:
    "A software engineering student building useful systems with product sense and backend depth.",
  description:
    "I'm Shiham Ahamed, a SLIIT software engineering student focused on full-stack web apps, backend APIs, cloud-native practice, and polished product interfaces.",
};

export const aboutStory: string[] = [
  "I learn fastest when an idea has to become a working product. My projects usually start with a real workflow, then grow into data models, APIs, interface states, and deployment decisions that force me to think like an engineer rather than only a UI builder.",
  "Recently I have been building across e-commerce, property and travel marketplaces, admin dashboards, Docker-based backend practice, and Kubernetes experiments. That mix has helped me connect frontend polish with the backend structure that keeps a product maintainable.",
  "My current direction is clear: become a software engineer who can contribute to practical full-stack systems, communicate tradeoffs, and keep improving through real projects, careful review, and consistent iteration.",
];

export const aboutStats: AboutStat[] = [
  {
    id: 1,
    value: "12+",
    label: "Projects",
    note: "built",
  },
  {
    id: 2,
    value: "2",
    label: "Large Systems",
    note: "in progress",
  },
  {
    id: 3,
    value: "4",
    label: "Core Areas",
    note: "of focus",
  },
];

export const focusAreas: FocusArea[] = [
  {
    id: 1,
    title: "Full-stack development",
    description:
      "Building complete applications with strong frontend experiences and reliable backend systems.",
  },
  {
    id: 2,
    title: "Backend and architecture",
    description:
      "Exploring APIs, authentication, service boundaries, and scalable application structure.",
  },
  {
    id: 3,
    title: "Modern UI engineering",
    description:
      "Designing polished interfaces with attention to responsiveness, motion, hierarchy, and clarity.",
  },
  {
    id: 4,
    title: "DevOps practice",
    description:
      "Using Docker, CI workflows, and Kubernetes experiments to understand how software runs beyond local development.",
  },
];

export const education = {
  university: "Sri Lanka Institute of Information Technology",
  program: "BSc (Hons) in Information Technology",
  specialization: "Specialization in Software Engineering",
  expectedGraduation: "Expected graduation: 2027",
  description:
    "Building academic and practical foundations through coursework, university projects, full-stack portfolio systems, and continuous self-learning.",
  logo: "/about/sliit-logo.png",
  logoAlt: "SLIIT Logo",
};

export const timeline: TimelineItem[] = [
  {
    id: 1,
    year: "Started",
    title: "Built my foundation",
    description:
      "Began learning programming fundamentals through coursework and small project-based practice.",
  },
  {
    id: 2,
    year: "Growth",
    title: "Moved into full-stack development",
    description:
      "Built applications involving frontend UI, backend logic, databases, authentication, and admin workflows.",
  },
  {
    id: 3,
    year: "Expansion",
    title: "Explored product and backend systems",
    description:
      "Expanded into Next.js, MERN, service-oriented design, Docker practice, Kubernetes experiments, and structured APIs.",
  },
  {
    id: 4,
    year: "Now",
    title: "Focusing on scalable systems",
    description:
      "Currently focused on production-minded portfolio architecture, DevOps workflows, and systems that can scale beyond demos.",
  },
];

export const values: string[] = [
  "I learn best by building real projects.",
  "I care about both technical structure and user experience.",
  "I value clarity, consistency, and maintainable code.",
  "I'm motivated by growth, curiosity, and practical problem solving.",
];

export const aboutClosing =
  "I'm working toward becoming a software engineer who can contribute to meaningful products, collaborate clearly with teams, and keep improving through real-world development.";
