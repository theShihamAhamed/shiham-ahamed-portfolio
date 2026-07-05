import { CurrentProject } from "@/types/project";

export const currentProjects: CurrentProject[] = [
  {
    id: 1,
    title: "Zuzi",
    description:
      "A production-style multi-vendor e-commerce SaaS designed with a scalable microservices architecture and product-focused engineering approach.",
    status: "In Progress",
    focus:
      "Currently focused on service boundaries, authentication workflows, caching, and payment-related architecture.",
    stack: [
      "Next.js",
      "TypeScript",
      "Microservices",
      "Prisma",
      "Redis",
      "Docker",
    ],
    highlights: [
      "NX monorepo",
      "ImageKit integration",
      "Role-based flows",
      "CI workflow",
    ],
  },
  {
    id: 2,
    title: "AI Healthcare Platform",
    description:
      "An AI-enabled appointment and telemedicine platform built around Spring Boot microservices, service discovery, and real-time healthcare workflows.",
    status: "In Progress",
    focus:
      "Currently focused on service communication, patient/auth flows, API documentation, and scalable healthcare architecture.",
    stack: [
      "Java",
      "Spring Boot",
      "MongoDB",
      "PostgreSQL",
      "Kubernetes",
      "Next.js",
    ],
    highlights: [
      "Eureka service discovery",
      "Spring Security",
      "OpenAPI",
      "Microservices",
    ],
  },
];
