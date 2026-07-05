export type AboutStat = {
  id: number;
  label: string;
  value: string;
  note: string;
};

export type FocusArea = {
  id: number;
  title: string;
  description: string;
};

export type Certification = {
  id: number | string;
  title: string;
  issuer?: string;
  provider: string;
  date?: string;
  url?: string;
  credentialId?: string;
  verifyUrl?: string;
  image: string;
  imageAlt?: string;
  note: string;
  skills?: string[]; // Skills learned: ["React", "Node.js", ...]
};

export type Achievement = {
  id: number | string;
  title: string;
  description?: string;
  event?: string;
  result?: string;
  date?: string;
  year?: string;
  icon?: string;
  note: string;
};

export type TimelineItem = {
  id: number;
  year: string;
  title: string;
  description: string;
  type?: "education" | "experience" | "milestone";
};

export type Education = {
  university: string;
  program: string;
  specialization?: string;
  expectedGraduation?: string;
  description: string;
  logo?: string; // Path to institution logo
  logoAlt?: string; // Alt text for logo
};
