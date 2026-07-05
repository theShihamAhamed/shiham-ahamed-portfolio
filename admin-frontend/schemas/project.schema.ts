import { z } from "zod";

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim().length === 0) {
    return undefined;
  }

  return value;
};

const requiredTrimmedString = (message: string) =>
  z.string().trim().min(1, message);

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const getValidYouTubeVideoId = (value: string | null | undefined) => {
  const candidate = value?.trim().split(/[?&#]/)[0];

  if (!candidate || !/^[A-Za-z0-9_-]{11}$/.test(candidate)) {
    return undefined;
  }

  return candidate;
};

const isYouTubeUrl = (value: string) => {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const segments = url.pathname.split("/").filter(Boolean);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    if (host === "youtu.be") {
      return Boolean(getValidYouTubeVideoId(segments[0]));
    }

    if (
      host !== "youtube.com" &&
      host !== "www.youtube.com" &&
      host !== "m.youtube.com"
    ) {
      return false;
    }

    if (segments[0] === "watch") {
      return Boolean(getValidYouTubeVideoId(url.searchParams.get("v")));
    }

    if (segments[0] === "embed" || segments[0] === "shorts") {
      return Boolean(getValidYouTubeVideoId(segments[1]));
    }

    return false;
  } catch {
    return false;
  }
};

const optionalTrimmedString = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1).optional(),
);

const optionalUrl = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .url("Enter a valid URL.")
    .refine(isHttpUrl, "Use an http or https URL.")
    .optional(),
);

const optionalYouTubeUrl = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .url("Enter a valid YouTube URL.")
    .refine(isHttpUrl, "Use an http or https URL.")
    .refine(
      isYouTubeUrl,
      "Use a YouTube watch, share, shorts, or embed URL.",
    )
    .optional(),
);

const optionalMonth = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM format.")
    .optional(),
);

const clearableOptionalUrl = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) {
      return true;
    }

    try {
      return isHttpUrl(value);
    } catch {
      return false;
    }
  }, "Use an http or https URL.");

const clearableOptionalYouTubeUrl = z
  .string()
  .trim()
  .refine((value) => !value || isHttpUrl(value), "Use an http or https URL.")
  .refine(
    (value) => !value || isYouTubeUrl(value),
    "Use a YouTube watch, share, shorts, or embed URL.",
  );

const clearableOptionalMonth = z
  .string()
  .trim()
  .refine(
    (value) => !value || /^\d{4}-(0[1-9]|1[0-2])$/.test(value),
    "Use YYYY-MM format.",
  );

const optionalStringList = z
  .array(z.string())
  .transform((items) => items.map((item) => item.trim()).filter(Boolean));

const requiredStringList = (message: string) =>
  optionalStringList.pipe(z.array(z.string().min(1)).min(1, message));

export const projectStatusSchema = z.enum(["completed", "in-progress", "planned"]);

export const imageAssetSchema = z.object({
  url: z.string().url(),
  fileId: z.string().min(1),
  alt: z.string().trim().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  name: z.string().trim().min(1).optional(),
});

export const projectTechStackItemSchema = z.object({
  label: requiredTrimmedString("Tech label is required."),
  category: z.string().trim().optional(),
  color: z.string().trim().optional(),
  showOnCard: z.boolean().optional().default(false),
});

export const createProjectFormSchema = z.object({
  title: requiredTrimmedString("Title is required."),
  slug: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case.")
      .optional(),
  ),
  shortDescription: requiredTrimmedString("Card Description is required."),
  description: requiredTrimmedString("Detail Intro is required."),
  projectType: requiredTrimmedString("Project type is required."),
  status: projectStatusSchema,
  year: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Year must be a four-digit string."),
  startDate: optionalMonth,
  endDate: optionalMonth,
  videoUrl: optionalYouTubeUrl,
  videoPosterUrl: optionalUrl,
  thumbnail: imageAssetSchema.optional().refine(Boolean, {
    message: "Thumbnail image is required.",
  }),
  gallery: z.array(imageAssetSchema).min(1, "At least one gallery image is required."),
  architecture: z.object({
    image: imageAssetSchema.optional(),
    summary: optionalTrimmedString,
    points: optionalStringList,
  }),
  links: z.object({
    github: optionalUrl,
    liveDemo: optionalUrl,
    article: optionalUrl,
  }),
  techStack: z
    .array(projectTechStackItemSchema)
    .min(1, "At least one tech stack item is required."),
  overview: requiredStringList("At least one overview paragraph is required."),
  highlights: requiredStringList("At least one highlight is required."),
  challenges: optionalStringList,
  futureImprovements: optionalStringList,
  isFeatured: z.boolean(),
  isVisible: z.boolean(),
});

export const updateProjectFormSchema = z.object({
  title: requiredTrimmedString("Title is required."),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case."),
  shortDescription: requiredTrimmedString("Card Description is required."),
  description: requiredTrimmedString("Detail Intro is required."),
  projectType: requiredTrimmedString("Project type is required."),
  status: projectStatusSchema,
  year: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Year must be a four-digit string."),
  startDate: clearableOptionalMonth,
  endDate: clearableOptionalMonth,
  videoUrl: clearableOptionalYouTubeUrl,
  videoPosterUrl: clearableOptionalUrl,
  links: z.object({
    github: clearableOptionalUrl,
    liveDemo: clearableOptionalUrl,
    article: clearableOptionalUrl,
  }),
  techStack: z
    .array(projectTechStackItemSchema)
    .min(1, "At least one tech stack item is required."),
  overview: requiredStringList("At least one overview paragraph is required."),
  highlights: requiredStringList("At least one highlight is required."),
  architecture: z.object({
    summary: z.string().trim(),
    points: optionalStringList,
  }),
  challenges: optionalStringList,
  futureImprovements: optionalStringList,
});

export type CreateProjectFormValues = z.input<typeof createProjectFormSchema>;
export type ParsedCreateProjectFormValues = z.output<typeof createProjectFormSchema>;
export type UpdateProjectFormValues = z.input<typeof updateProjectFormSchema>;
export type ParsedUpdateProjectFormValues = z.output<typeof updateProjectFormSchema>;
