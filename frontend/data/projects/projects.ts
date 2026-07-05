import { Project } from "@/types/project";

export const projects: Project[] = [
  {
    id: 1,
    slug: "zuzi",
    title: "Zuzi",
    shortDescription:
      "A production-style multi-vendor e-commerce SaaS built with microservices, scalable infrastructure, and modern engineering workflows.",
    longDescription:
      "Zuzi is an advanced multi-vendor e-commerce platform designed around scalable service boundaries, practical product workflows, and modern development tooling.",
    status: "Completed",
    year: "2026",
    startDate: "2026-01",
    endDate: "2026-04",
    thumbnail: "/projects/zuzi/zuzi-cover.jpg",
    heroMedia: {
      kind: "video",
      src: "/projects/zuzi/zuzi-demo.mp4",
      poster: "/projects/zuzi/zuzi-cover.jpg",
    },
    featured: true,
    sortOrder: 1,
    projectType: "Microservices",
    links: {
      github: "https://github.com/theShihamAhamed",
      live: "https://github.com/theShihamAhamed",
    },
    techStack: [
      { label: "Next.js", color: "#7c3aed" },
      { label: "MongoDB", color: "#15803d" },
      { label: "Prisma", color: "#3178c6" },
      { label: "Redis", color: "#f97316" },
      { label: "Docker", color: "#0891b2" },
    ],
    highlights: [
      "Multi-vendor architecture",
      "Authentication and role-based flows",
      "Caching and OTP workflows",
      "Media handling and optimized asset delivery",
      "CI-oriented development workflow",
    ],
    overview: [
      "Zuzi is a product-focused multi-vendor commerce platform built to explore scalable architecture and modern engineering practices.",
      "The project is structured to separate concerns such as authentication, sellers, products, media, and other platform workflows.",
      "The goal is to build something closer to a production-style system rather than a simple CRUD application.",
    ],
    techGroups: {
      languages: ["TypeScript", "JavaScript"],
      frameworks: ["Next.js", "React", "Express.js"],
      databases: ["MongoDB", "Prisma", "Redis"],
      tools: [
        "GitHub Actions",
        "ImageKit",
        "Postman",
        "Docker",
        "NX Monorepo",
        "Arc jet",
        "jest",
      ],
    },
    gallery: [
      { id: 1, src: "/projects/zuzi/1.jpg", alt: "Zuzi home screen" },
      { id: 2, src: "/projects/zuzi/2.jpg", alt: "Zuzi dashboard" },
      { id: 3, src: "/projects/zuzi/3.jpg", alt: "Zuzi product management" },
      { id: 4, src: "/projects/zuzi/4.jpg", alt: "Zuzi seller view" },
      { id: 5, src: "/projects/zuzi/1.jpg", alt: "Zuzi home screen" },
      { id: 6, src: "/projects/zuzi/2.jpg", alt: "Zuzi dashboard" },
      { id: 7, src: "/projects/zuzi/3.jpg", alt: "Zuzi product management" },
      { id: 8, src: "/projects/zuzi/4.jpg", alt: "Zuzi seller view" },
    ],
    architectureImage: "/projects/zuzi/architecture.png",
    architectureSummary:
      "The platform is organized around modular service boundaries to support product growth, maintainability, and cleaner ownership of business logic.",
    architecturePoints: [
      "Separated service concerns",
      "Role-driven application flows",
      "Extensible backend structure",
      "Support for scalable feature growth",
    ],
    mdxUrl:
      "https://raw.githubusercontent.com/theShihamAhamed/portfolio-content/refs/heads/main/portfolio-content/projects/powerwise.mdx",
    challenges: [
      "Defining clean service boundaries",
      "Balancing product complexity and maintainability",
      "Structuring practical role-based workflows",
      "Managing evolving architecture decisions while building",
    ],
    futureImprovements: [
      "Expand reporting and analytics",
      "Add deeper test coverage",
      "Improve monitoring and observability",
      "Enhance deployment automation",
    ],
  },
  {
    id: 2,
    slug: "ai-healthcare-platform",
    title: "AI Healthcare Platform",
    shortDescription:
      "An AI-enabled appointment and telemedicine platform designed with microservices, cloud-native tools, and real-time workflows.",
    longDescription:
      "A healthcare platform built around Spring Boot microservices, communication flows, service discovery, and scalable backend structure.",
    status: "In Progress",
    year: "2026",
    startDate: "2026-03",
    endDate: undefined,
    thumbnail: "/projects/healthcare/healthcare-cover.jpg",
    heroMedia: {
      kind: "image",
      src: "/projects/healthcare/healthcare-cover.jpg",
    },
    featured: true,
    sortOrder: 2,
    projectType: "Microservices",
    links: {
      github: "https://github.com/theShihamAhamed",
      live: "",
    },
    techStack: [
      { label: "Java", color: "#15803d" },
      { label: "Spring Boot", color: "#3178c6" },
      { label: "MongoDB", color: "#f97316" },
      { label: "PostgreSQL", color: "#db2777" },
      { label: "Kubernetes", color: "#7c3aed" },
    ],
    highlights: [
      "Spring Boot microservices",
      "Service discovery",
      "Structured backend modules",
      "API documentation support",
      "Scalable healthcare workflow thinking",
    ],
    overview: [
      "This platform explores healthcare appointments and telemedicine through a cloud-native service-based architecture.",
      "It combines backend system design, security, service discovery, and structured data workflows.",
      "The project is intended to reflect more advanced software engineering and architecture practices.",
    ],
    techGroups: {
      languages: ["Java", "TypeScript", "JavaScript"],
      frameworks: ["Spring Boot", "Next.js", "Spring Security"],
      databases: ["MongoDB", "PostgreSQL"],
      tools: ["Maven", "Swagger", "Postman"],
      platforms: ["Docker", "Kubernetes", "Eureka"],
    },
    gallery: [
      { id: 1, src: "/projects/healthcare/1.png", alt: "Healthcare screen 1" },
      { id: 2, src: "/projects/healthcare/2.png", alt: "Healthcare screen 2" },
      { id: 3, src: "/projects/healthcare/3.png", alt: "Healthcare screen 3" },
    ],
    architectureImage: "/projects/healthcare/architecture.png",
    architectureSummary:
      "The system uses a microservices-oriented backend approach to separate healthcare workflows and improve scalability.",
    architecturePoints: [
      "Service discovery for backend services",
      "Independent workflow modules",
      "Security and validation handling",
      "Cloud-native deployment direction",
    ],
    mdxUrl:
      "https://github.com/kavishkasandaruwan2002/PowerWise/blob/main/README.md",
    challenges: [
      "Designing service communication clearly",
      "Maintaining scalability while keeping development manageable",
      "Handling domain complexity across healthcare workflows",
    ],
    futureImprovements: [
      "Add richer AI-assisted features",
      "Expand observability and tracing",
      "Improve deployment automation",
      "Refine user-facing product flows",
    ],
  },
];
