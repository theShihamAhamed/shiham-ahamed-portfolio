import type { SkillCategory } from "@/types/skills";

export const skillCategories: SkillCategory[] = [
  {
    id: "frontend",
    title: "Frontend & Product Interfaces",
    description:
      "Building responsive, accessible, and maintainable interfaces for real product workflows.",
    items: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "shadcn/ui",
      "Radix UI",
      "React Hook Form",
      "Zod",
    ],
  },
  {
    id: "backend",
    title: "Backend APIs & Application Logic",
    description:
      "Designing API-driven applications with authentication, validation, real-time features, and clean service structure.",
    items: [
      "Node.js",
      "Express.js",
      "Spring Boot",
      "REST APIs",
      "JWT/Auth",
      "Socket.IO",
      "Webhooks",
      "Swagger",
    ],
  },
  {
    id: "data-systems",
    title: "Databases, Messaging & System Design",
    description:
      "Working with data models, persistence layers, caching, event-driven flows, and scalable backend concepts.",
    items: [
      "MongoDB",
      "Mongoose",
      "PostgreSQL",
      "MySQL",
      "Prisma",
      "Drizzle ORM",
      "Redis",
      "Kafka",
    ],
  },
  {
    id: "devops-testing",
    title: "DevOps, Testing & Delivery",
    description:
      "Practicing deployment-ready workflows with containers, CI/CD, testing, cloud services, and production-minded tooling.",
    items: [
      "Docker",
      "Docker Compose",
      "Kubernetes",
      "GitHub Actions",
      "Vercel",
      "Playwright",
      "Jest",
      "AWS S3",
    ],
  },
];
