import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import mongoose from "mongoose";

const loadLocalEnv = () => {
  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const contents = fs.readFileSync(envPath, "utf8");

  for (const line of contents.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

loadLocalEnv();

const mongoUri = process.env.MONGO_URI?.trim();

if (!mongoUri) {
  console.error("MONGO_URI is required to seed public portfolio data.");
  process.exit(1);
}

const media = (fileId, url, alt, name) => ({
  url,
  fileId: `seed:${fileId}`,
  alt,
  width: 1600,
  height: 1000,
  ...(name ? { name } : {}),
});

const tech = (label, category, color, showOnCard = false) => ({
  label,
  category,
  color,
  showOnCard,
});

const siteSettings = {
  singletonKey: "primary",
  name: "Shiham Ahamed",
  targetRole: "Software Engineering Student",
  email: "theshihamahamed@gmail.com",
  githubUrl: "https://github.com/theShihamAhamed",
  linkedinUrl: "https://www.linkedin.com/in/theshihamahamed/",
  resumeUrl:
    "https://drive.google.com/file/d/1MTSsUA8V7Po2AsNXT8kZ5sLOpzC8l7qm/view?usp=drive_link",
  hero: {
    badge: "Software engineering student building production-minded systems",
    title: "I build modern web apps and scalable software systems.",
    highlightedPhrase: "modern web apps and scalable software systems",
    description:
      "I build full-stack applications, backend systems, and polished user experiences with a focus on practical engineering, clean architecture, and real-world reliability.",
  },
  education: {
    institution: "Sri Lanka Institute of Information Technology",
    degree: "BSc (Hons) in Information Technology",
    specialization: "Software Engineering",
    expectedGraduation: "2027",
  },
};

const projects = [
  {
    title: "ZUZI",
    slug: "zuzi",
    shortDescription:
      "A production-style multi-vendor commerce platform with seller workflows, media handling, and scalable service boundaries.",
    description:
      "ZUZI is a full-stack commerce platform built to explore real product complexity: authentication, seller onboarding, catalog workflows, image delivery, and modular backend structure.",
    projectType: "SaaS Commerce",
    status: "completed",
    year: "2026",
    startDate: "2026-01",
    endDate: "2026-04",
    thumbnail: media(
      "projects:zuzi:thumbnail",
      "/projects/zuzi/zuzi-cover.jpg",
      "ZUZI commerce dashboard preview",
      "Commerce dashboard",
    ),
    gallery: [
      media("projects:zuzi:gallery-1", "/projects/zuzi/1.jpg", "ZUZI storefront home", "Storefront"),
      media("projects:zuzi:gallery-2", "/projects/zuzi/2.jpg", "ZUZI seller dashboard", "Seller dashboard"),
      media("projects:zuzi:gallery-3", "/projects/zuzi/3.jpg", "ZUZI product management", "Product management"),
      media("projects:zuzi:gallery-4", "/projects/zuzi/4.jpg", "ZUZI seller product view", "Seller tools"),
    ],
    architecture: {
      image: media(
        "projects:zuzi:architecture",
        "/projects/zuzi/architecture.png",
        "ZUZI service architecture diagram",
        "Service architecture",
      ),
      summary:
        "The platform separates buyer, seller, product, media, and authentication workflows so each area can grow without turning into one oversized module.",
      points: [
        "Role-aware flows for buyers, sellers, and admins",
        "ImageKit-backed media records with reusable image metadata",
        "Service boundaries designed around commerce workflows",
        "Cache-ready read paths for product and storefront data",
      ],
    },
    links: {
      github: "https://github.com/theShihamAhamed/zuzi",
      liveDemo: "https://github.com/theShihamAhamed/zuzi",
      article:
        "https://raw.githubusercontent.com/theShihamAhamed/portfolio-content/refs/heads/main/portfolio-content/projects/powerwise.mdx",
    },
    techStack: [
      tech("Next.js", "frontend", "#111827", true),
      tech("React", "frontend", "#38bdf8", true),
      tech("Express.js", "backend", "#334155", true),
      tech("MongoDB", "databases", "#16a34a", true),
      tech("Redis", "databases", "#dc2626"),
      tech("Docker", "infrastructure", "#0891b2", true),
      tech("ImageKit", "tools", "#7c3aed"),
      tech("GitHub Actions", "tools", "#2563eb"),
    ],
    overview: [
      "ZUZI focuses on realistic commerce flows rather than a simple product CRUD demo.",
      "The project models vendor ownership, media records, catalog browsing, and account flows as separate concerns.",
      "It gave the portfolio a strong example of system thinking across frontend, backend, and deployment boundaries.",
    ],
    highlights: [
      "Multi-vendor commerce workflow",
      "Seller and customer role separation",
      "Reusable image metadata and optimized media delivery",
      "Modular backend structure for growth",
    ],
    challenges: [
      "Keeping service boundaries clear while product features expanded",
      "Designing seller flows that were flexible without becoming vague",
      "Balancing polished UI with backend depth",
    ],
    futureImprovements: [
      "Add analytics dashboards for sellers",
      "Introduce automated integration tests for checkout-like flows",
      "Add observability around product and media operations",
    ],
    isFeatured: true,
    isVisible: true,
    displayOrder: 1,
  },
  {
    title: "CodeVerse",
    slug: "codeverse",
    shortDescription:
      "A collaborative learning workspace for coding notes, snippets, practice tasks, and guided project progress.",
    description:
      "CodeVerse helps learners organize programming notes, reusable snippets, project tasks, and progress checkpoints in one focused workspace.",
    projectType: "Learning Platform",
    status: "in-progress",
    year: "2026",
    startDate: "2026-03",
    thumbnail: media(
      "projects:codeverse:thumbnail",
      "/projects/healthcare/healthcare-cover.jpg",
      "CodeVerse workspace preview",
      "Workspace overview",
    ),
    gallery: [
      media("projects:codeverse:gallery-1", "/projects/zuzi/1.jpg", "CodeVerse dashboard", "Dashboard"),
      media("projects:codeverse:gallery-2", "/projects/zuzi/2.jpg", "CodeVerse snippet library", "Snippet library"),
      media("projects:codeverse:gallery-3", "/projects/zuzi/3.jpg", "CodeVerse task board", "Task board"),
    ],
    architecture: {
      image: media(
        "projects:codeverse:architecture",
        "/projects/healthcare/architecture.webp",
        "CodeVerse application architecture",
        "Learning workspace architecture",
      ),
      summary:
        "The app keeps learning content, project tasks, and snippet collections separate while sharing one authenticated user workspace.",
      points: [
        "Workspace-owned content records",
        "Reusable snippets organized by language and topic",
        "Project progress tracking with checklist-style updates",
        "Server-side search path planned for notes and snippets",
      ],
    },
    links: {
      github: "https://github.com/theShihamAhamed/codeverse",
    },
    techStack: [
      tech("Next.js", "frontend", "#111827", true),
      tech("TypeScript", "languages", "#2563eb", true),
      tech("Node.js", "backend", "#16a34a", true),
      tech("MongoDB", "databases", "#15803d", true),
      tech("Zod", "tools", "#7c3aed"),
      tech("Tailwind CSS", "frontend", "#06b6d4", true),
    ],
    overview: [
      "CodeVerse is designed around the way a student actually learns: small notes, reusable code, and projects that evolve over time.",
      "The product is intentionally practical, with less emphasis on social feeds and more on organizing work that helps projects ship.",
    ],
    highlights: [
      "Snippet library grouped by language and topic",
      "Project progress boards for learning goals",
      "Validation-focused forms for clean records",
      "Designed for fast scanning during study sessions",
    ],
    challenges: [
      "Avoiding a cluttered interface while supporting several content types",
      "Designing data models flexible enough for multiple learning styles",
    ],
    futureImprovements: [
      "Add markdown-backed note rendering",
      "Add tag search and saved filters",
      "Add import/export for study archives",
    ],
    isFeatured: true,
    isVisible: true,
    displayOrder: 2,
  },
  {
    title: "gedaraStay",
    slug: "gedarastay",
    shortDescription:
      "A homestay booking concept for Sri Lankan travel stays with host listings, search, availability, and trust-focused details.",
    description:
      "gedaraStay is a booking platform concept focused on local stays, host-managed listings, availability, and traveler-friendly discovery for Sri Lankan destinations.",
    projectType: "Travel Marketplace",
    status: "completed",
    year: "2025",
    startDate: "2025-08",
    endDate: "2025-11",
    thumbnail: media(
      "projects:gedarastay:thumbnail",
      "/projects/zuzi/2.jpg",
      "gedaraStay listing discovery screen",
      "Listing discovery",
    ),
    gallery: [
      media("projects:gedarastay:gallery-1", "/projects/zuzi/2.jpg", "gedaraStay search results", "Search results"),
      media("projects:gedarastay:gallery-2", "/projects/zuzi/3.jpg", "gedaraStay listing detail", "Listing detail"),
      media("projects:gedarastay:gallery-3", "/projects/zuzi/4.jpg", "gedaraStay host dashboard", "Host dashboard"),
    ],
    architecture: {
      image: media(
        "projects:gedarastay:architecture",
        "/projects/zuzi/architecture.png",
        "gedaraStay booking architecture",
        "Booking architecture",
      ),
      summary:
        "The system separates host listing management, public search, booking intent, and media records to keep the marketplace flows understandable.",
      points: [
        "Host-owned listing records",
        "Search filters for location, guest count, and price",
        "Availability model prepared for booking workflows",
        "Image records stored separately from listing content",
      ],
    },
    links: {
      github: "https://github.com/theShihamAhamed/gedarastay",
      liveDemo: "https://github.com/theShihamAhamed/gedarastay",
    },
    techStack: [
      tech("React", "frontend", "#38bdf8", true),
      tech("Express.js", "backend", "#334155", true),
      tech("MongoDB", "databases", "#16a34a", true),
      tech("JWT", "backend", "#f59e0b"),
      tech("Cloudinary", "tools", "#2563eb"),
      tech("Tailwind CSS", "frontend", "#06b6d4", true),
    ],
    overview: [
      "gedaraStay explores marketplace thinking through a local travel domain.",
      "The project emphasizes practical listing data, host actions, and visitor-friendly search instead of only static destination cards.",
    ],
    highlights: [
      "Host listing management",
      "Destination and availability search",
      "Listing gallery support",
      "Trust-focused accommodation details",
    ],
    challenges: [
      "Modeling listing availability in a way that could support real booking rules",
      "Keeping the traveler search experience clear on smaller screens",
    ],
    futureImprovements: [
      "Add calendar-based booking requests",
      "Add host verification workflow",
      "Add saved trips and wishlists",
    ],
    isFeatured: true,
    isVisible: true,
    displayOrder: 3,
  },
  {
    title: "DevOps Playground API",
    slug: "devops-playground-api",
    shortDescription:
      "A backend API sandbox for CI pipelines, Dockerized services, health checks, logging, and deployment practice.",
    description:
      "DevOps Playground API is a backend-first project used to practice production concerns such as containerization, environment configuration, health checks, CI workflows, and API documentation.",
    projectType: "Backend API",
    status: "in-progress",
    year: "2026",
    startDate: "2026-05",
    thumbnail: media(
      "projects:devops-playground-api:thumbnail",
      "/projects/healthcare/healthcare-cover.jpg",
      "DevOps Playground API dashboard",
      "API dashboard",
    ),
    gallery: [
      media("projects:devops-playground-api:gallery-1", "/projects/zuzi/3.jpg", "API documentation screen", "API docs"),
      media("projects:devops-playground-api:gallery-2", "/projects/zuzi/4.jpg", "Service health dashboard", "Health checks"),
      media("projects:devops-playground-api:gallery-3", "/projects/zuzi/1.jpg", "Pipeline status overview", "Pipeline status"),
    ],
    architecture: {
      image: media(
        "projects:devops-playground-api:architecture",
        "/projects/healthcare/architecture.webp",
        "DevOps Playground API architecture",
        "API architecture",
      ),
      summary:
        "The API is organized around clear service modules, container runtime configuration, and deployment health signals.",
      points: [
        "Dockerized service runtime",
        "Health and readiness endpoints",
        "CI-ready lint, test, and build stages",
        "Structured logging and environment validation",
      ],
    },
    links: {
      github: "https://github.com/theShihamAhamed/devops-playground-api",
      article: "https://github.com/theShihamAhamed/devops-playground-api#readme",
    },
    techStack: [
      tech("Node.js", "backend", "#16a34a", true),
      tech("Express.js", "backend", "#334155", true),
      tech("Docker", "infrastructure", "#0891b2", true),
      tech("GitHub Actions", "tools", "#2563eb", true),
      tech("Swagger", "tools", "#16a34a"),
      tech("MongoDB", "databases", "#15803d", true),
    ],
    overview: [
      "This project exists to practice the operational side of backend engineering.",
      "It treats API health, logs, environment setup, CI, and deployment behavior as first-class parts of the project.",
    ],
    highlights: [
      "Docker-first backend workflow",
      "Health checks and API documentation",
      "CI pipeline practice",
      "Environment validation for safer startup",
    ],
    challenges: [
      "Making the project useful without overbuilding fake business logic",
      "Keeping deployment configuration understandable and repeatable",
    ],
    futureImprovements: [
      "Add OpenTelemetry tracing",
      "Add load-test scripts",
      "Add deployment examples for multiple platforms",
    ],
    isFeatured: true,
    isVisible: true,
    displayOrder: 4,
  },
  {
    title: "Kubernetes Playground",
    slug: "kubernetes-playground",
    shortDescription:
      "A hands-on cloud-native practice repo for manifests, services, ingress, config maps, and small app deployments.",
    description:
      "Kubernetes Playground is a practical learning project for deploying small services, writing manifests, testing service networking, and understanding cloud-native release workflows.",
    projectType: "Cloud Native",
    status: "in-progress",
    year: "2026",
    startDate: "2026-06",
    thumbnail: media(
      "projects:kubernetes-playground:thumbnail",
      "/projects/zuzi/4.jpg",
      "Kubernetes Playground deployment view",
      "Deployment view",
    ),
    gallery: [
      media("projects:kubernetes-playground:gallery-1", "/projects/zuzi/4.jpg", "Kubernetes services overview", "Services"),
      media("projects:kubernetes-playground:gallery-2", "/projects/zuzi/1.jpg", "Kubernetes manifest structure", "Manifests"),
      media("projects:kubernetes-playground:gallery-3", "/projects/zuzi/2.jpg", "Kubernetes deployment notes", "Deployment notes"),
    ],
    architecture: {
      image: media(
        "projects:kubernetes-playground:architecture",
        "/projects/healthcare/architecture.webp",
        "Kubernetes Playground architecture",
        "Cluster practice architecture",
      ),
      summary:
        "The playground uses small services to practice how deployments, services, ingress rules, and config maps fit together.",
      points: [
        "Deployment and service manifests",
        "Config maps for runtime settings",
        "Ingress-ready local cluster experiments",
        "Small API workloads for repeatable testing",
      ],
    },
    techStack: [
      tech("Kubernetes", "infrastructure", "#326ce5", true),
      tech("Docker", "infrastructure", "#0891b2", true),
      tech("Node.js", "backend", "#16a34a", true),
      tech("YAML", "languages", "#f59e0b"),
      tech("Minikube", "tools", "#7c3aed"),
      tech("kubectl", "tools", "#2563eb", true),
    ],
    overview: [
      "This project turns Kubernetes learning into a repeatable practice environment.",
      "Instead of treating cloud-native tooling as theory, it uses small services and manifests to make the concepts visible.",
    ],
    highlights: [
      "Manifest-driven deployment practice",
      "Local cluster experiments",
      "Service networking basics",
      "Config map and ingress exploration",
    ],
    challenges: [
      "Understanding what belongs in app code versus cluster configuration",
      "Debugging service networking from first principles",
    ],
    futureImprovements: [
      "Add Helm chart examples",
      "Add monitoring with Prometheus and Grafana",
      "Add a GitOps deployment example",
    ],
    isFeatured: false,
    isVisible: true,
    displayOrder: 5,
  },
  {
    title: "CityNest",
    slug: "citynest",
    shortDescription:
      "A property discovery and tenant management concept for rentals, inquiries, saved listings, and admin review workflows.",
    description:
      "CityNest is a property platform concept designed around rental discovery, listing management, inquiry tracking, and clean admin workflows.",
    projectType: "Property Platform",
    status: "completed",
    year: "2025",
    startDate: "2025-04",
    endDate: "2025-07",
    thumbnail: media(
      "projects:citynest:thumbnail",
      "/projects/zuzi/1.jpg",
      "CityNest property listing screen",
      "Property listings",
    ),
    gallery: [
      media("projects:citynest:gallery-1", "/projects/zuzi/1.jpg", "CityNest listing grid", "Listing grid"),
      media("projects:citynest:gallery-2", "/projects/zuzi/2.jpg", "CityNest listing detail", "Listing detail"),
      media("projects:citynest:gallery-3", "/projects/zuzi/3.jpg", "CityNest admin review", "Admin review"),
    ],
    architecture: {
      image: media(
        "projects:citynest:architecture",
        "/projects/zuzi/architecture.png",
        "CityNest architecture diagram",
        "Property platform architecture",
      ),
      summary:
        "CityNest separates property records, inquiry workflows, saved listings, and admin review state so listing operations remain easy to reason about.",
      points: [
        "Property and image records stored independently",
        "Inquiry workflow designed for renter-to-owner contact",
        "Admin review state for listing moderation",
        "Saved listing model prepared for user dashboards",
      ],
    },
    links: {
      github: "https://github.com/theShihamAhamed/citynest",
    },
    techStack: [
      tech("React", "frontend", "#38bdf8", true),
      tech("Node.js", "backend", "#16a34a", true),
      tech("Express.js", "backend", "#334155", true),
      tech("MongoDB", "databases", "#15803d", true),
      tech("JWT", "backend", "#f59e0b"),
      tech("Multer", "tools", "#7c3aed"),
    ],
    overview: [
      "CityNest explores the shape of a rental listing product with admin-friendly workflows.",
      "The project focuses on clean records, useful detail pages, and listing states that could support a real moderation process.",
    ],
    highlights: [
      "Property discovery and listing detail pages",
      "Inquiry-oriented contact workflow",
      "Admin review concepts",
      "Saved-listing data model direction",
    ],
    challenges: [
      "Balancing public discovery with admin review constraints",
      "Designing listing data that remains clear as property types vary",
    ],
    futureImprovements: [
      "Add map-based search",
      "Add owner dashboards",
      "Add document upload and verification flows",
    ],
    isFeatured: false,
    isVisible: true,
    displayOrder: 6,
  },
];

const certifications = [
  {
    title: "Python for Everybody",
    provider: "University of Michigan",
    note:
      "Strengthened programming fundamentals, data structures, HTTP basics, and practical scripting habits.",
    image: media(
      "certifications:python-for-everybody",
      "/certificates/python-certificate.jpg",
      "Python for Everybody certificate",
      "Python certificate",
    ),
    verifyUrl: "https://www.coursera.org/",
    credentialId: "seed-python-2025",
    date: "2025-08",
    skills: ["Python", "Data structures", "HTTP", "Problem solving"],
    isVisible: true,
    displayOrder: 1,
  },
  {
    title: "MERN Stack Development",
    provider: "MongoDB, Express, React, Node.js",
    note:
      "Focused on full-stack application structure, API integration, authentication, and database-backed UI workflows.",
    image: media(
      "certifications:mern-stack",
      "/certificates/mern-certificate.jpg",
      "MERN stack certificate",
      "MERN certificate",
    ),
    credentialId: "seed-mern-2025",
    date: "2025-10",
    skills: ["MongoDB", "Express.js", "React", "Node.js"],
    isVisible: true,
    displayOrder: 2,
  },
  {
    title: "Docker Essentials",
    provider: "IBM SkillsBuild",
    note:
      "Practiced container images, local service composition, runtime environment setup, and deployment-ready project structure.",
    image: media(
      "certifications:docker-essentials",
      "/certificates/mern-certificate.jpg",
      "Docker Essentials certificate",
      "Docker certificate",
    ),
    verifyUrl: "https://skillsbuild.org/",
    date: "2026-02",
    skills: ["Docker", "Containers", "Service runtime", "DevOps"],
    isVisible: true,
    displayOrder: 3,
  },
  {
    title: "Cloud Native Foundations",
    provider: "CNCF Learning",
    note:
      "Introduced Kubernetes concepts, service orchestration, declarative configuration, and cloud-native deployment vocabulary.",
    image: media(
      "certifications:cloud-native-foundations",
      "/certificates/python-certificate.jpg",
      "Cloud Native Foundations certificate",
      "Cloud native certificate",
    ),
    date: "2026-04",
    skills: ["Kubernetes", "Cloud native", "Services", "Deployment"],
    isVisible: true,
    displayOrder: 4,
  },
];

const achievements = [
  {
    title: "CodeRush Hackathon Finalist",
    note:
      "Built and presented a working product concept under time pressure with a small team, focusing on useful scope and reliable delivery.",
    event: "CodeRush Hackathon",
    result: "Finalist",
    date: "2025-09",
    year: "2025",
    icon: "trophy",
    isVisible: true,
    displayOrder: 1,
  },
  {
    title: "SLIIT Software Project Showcase",
    note:
      "Presented a full-stack project with practical architecture, role-based flows, and a clear product demo.",
    event: "SLIIT Project Showcase",
    result: "Presented",
    date: "2025-11",
    year: "2025",
    icon: "badge-check",
    isVisible: true,
    displayOrder: 2,
  },
  {
    title: "DevOps Practice Milestone",
    note:
      "Created repeatable Docker and CI workflows for backend API practice, turning deployment concerns into a regular development habit.",
    event: "Self-directed engineering practice",
    result: "Completed milestone",
    date: "2026-03",
    year: "2026",
    icon: "terminal",
    isVisible: true,
    displayOrder: 3,
  },
  {
    title: "Open Source Portfolio Rebuild",
    note:
      "Reworked the portfolio into a data-driven production-style system with admin management, MongoDB reads, and deployable frontend architecture.",
    event: "Portfolio production upgrade",
    result: "In progress",
    date: "2026-07",
    year: "2026",
    icon: "sparkles",
    isVisible: true,
    displayOrder: 4,
  },
];

const currentlyBuildingItems = [
  {
    title: "Kubernetes Playground",
    description:
      "A hands-on practice environment for deployments, services, ingress, config maps, and small cloud-native experiments.",
    status: "In progress",
    currentFocus:
      "Building repeatable local cluster examples and documenting service networking behavior.",
    techStack: ["Kubernetes", "Docker", "kubectl", "Node.js", "YAML"],
    highlights: [
      "Manifest-first deployment practice",
      "Local cluster workflows",
      "Service and ingress experiments",
    ],
    link: "https://github.com/theShihamAhamed/kubernetes-playground",
    isVisible: true,
    displayOrder: 1,
  },
  {
    title: "CodeVerse",
    description:
      "A focused workspace for coding notes, snippets, project tasks, and student-friendly learning progress.",
    status: "Active build",
    currentFocus:
      "Refining the data model for snippets, project notes, tags, and fast search.",
    techStack: ["Next.js", "TypeScript", "MongoDB", "Zod", "Tailwind CSS"],
    highlights: [
      "Snippet organization",
      "Project learning boards",
      "Search-ready note structure",
    ],
    link: "https://github.com/theShihamAhamed/codeverse",
    isVisible: true,
    displayOrder: 2,
  },
  {
    title: "DevOps Playground API",
    description:
      "A backend API sandbox for Docker, CI checks, API docs, health endpoints, and deployment practice.",
    status: "In progress",
    currentFocus:
      "Adding structured logs, environment validation, and CI-friendly quality gates.",
    techStack: ["Node.js", "Express.js", "Docker", "GitHub Actions", "Swagger"],
    highlights: [
      "Health and readiness endpoints",
      "Dockerized local runtime",
      "CI build and lint workflow",
    ],
    link: "https://github.com/theShihamAhamed/devops-playground-api",
    isVisible: true,
    displayOrder: 3,
  },
  {
    title: "Portfolio Admin Settings",
    description:
      "A dashboard-controlled settings workflow for hero copy, contact links, resume URL, and education profile data.",
    status: "Polishing",
    currentFocus:
      "Connecting public rendering to the same MongoDB settings used by the admin dashboard.",
    techStack: ["Next.js", "MongoDB", "Express.js", "React Query", "Zod"],
    highlights: [
      "Singleton settings model",
      "Admin edit workflow",
      "Server-only public reads",
    ],
    isVisible: true,
    displayOrder: 4,
  },
];

const upsertByField = async (collectionName, fieldName, documents) => {
  const collection = mongoose.connection.collection(collectionName);
  const now = new Date();
  const operations = documents.map((document) => ({
    updateOne: {
      filter: { [fieldName]: document[fieldName] },
      update: {
        $set: {
          ...document,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      upsert: true,
    },
  }));

  if (operations.length === 0) {
    return { matchedCount: 0, upsertedCount: 0, modifiedCount: 0 };
  }

  return collection.bulkWrite(operations, { ordered: false });
};

const run = async () => {
  await mongoose.connect(mongoUri, {
    autoIndex: true,
    retryWrites: false,
  });

  const siteResult = await upsertByField("sitesettings", "singletonKey", [
    siteSettings,
  ]);
  const projectResult = await upsertByField("projects", "slug", projects);
  const certificationResult = await upsertByField(
    "certifications",
    "title",
    certifications,
  );
  const achievementResult = await upsertByField(
    "achievements",
    "title",
    achievements,
  );
  const currentlyBuildingResult = await upsertByField(
    "currentlybuildings",
    "title",
    currentlyBuildingItems,
  );

  console.log("Seed complete.");
  console.table([
    {
      collection: "sitesettings",
      matched: siteResult.matchedCount,
      modified: siteResult.modifiedCount,
      upserted: siteResult.upsertedCount,
    },
    {
      collection: "projects",
      matched: projectResult.matchedCount,
      modified: projectResult.modifiedCount,
      upserted: projectResult.upsertedCount,
    },
    {
      collection: "certifications",
      matched: certificationResult.matchedCount,
      modified: certificationResult.modifiedCount,
      upserted: certificationResult.upsertedCount,
    },
    {
      collection: "achievements",
      matched: achievementResult.matchedCount,
      modified: achievementResult.modifiedCount,
      upserted: achievementResult.upsertedCount,
    },
    {
      collection: "currentlybuildings",
      matched: currentlyBuildingResult.matchedCount,
      modified: currentlyBuildingResult.modifiedCount,
      upserted: currentlyBuildingResult.upsertedCount,
    },
  ]);
};

run()
  .catch((error) => {
    console.error("Seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
