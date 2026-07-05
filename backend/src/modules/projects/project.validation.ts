import { z } from "zod";

import { slugPattern } from "../../utils/slug";
import { projectStatuses } from "./project.types";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

const fileIdSchema = z
  .string()
  .trim()
  .min(1, "fileId is required")
  .max(256, "fileId is too long")
  .regex(
    /^(seed:[A-Za-z0-9:_-]+|[A-Za-z0-9_-]+)$/,
    "fileId contains invalid characters",
  );

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim().length === 0) {
    return undefined;
  }

  return value;
};

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const optionalUrlSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .url("Must be a valid URL")
    .refine(isHttpUrl, "URL must use http or https")
    .optional(),
);

const optionalTrimmedStringSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1).optional(),
);

const requiredTrimmedStringSchema = z.string().trim().min(1);

const trimmedStringArraySchema = (minLength: number) =>
  z
    .array(z.string())
    .transform((items) => items.map((item) => item.trim()).filter(Boolean))
    .pipe(z.array(requiredTrimmedStringSchema).min(minLength));

const optionalTrimmedStringArraySchema = z
  .array(z.string())
  .transform((items) => items.map((item) => item.trim()).filter(Boolean))
  .optional();

const imageAssetSchema = z
  .object({
    url: z.string().trim().url("Image URL must be valid"),
    fileId: fileIdSchema,
    alt: requiredTrimmedStringSchema,
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    name: optionalTrimmedStringSchema,
  })
  .strict();

const linksSchema = z
  .object({
    github: optionalUrlSchema,
    liveDemo: optionalUrlSchema,
    article: optionalUrlSchema,
  })
  .strict();

const techStackItemSchema = z
  .object({
    label: requiredTrimmedStringSchema,
    category: optionalTrimmedStringSchema,
    color: optionalTrimmedStringSchema,
    showOnCard: z.boolean().optional().default(false),
  })
  .strict();

const architectureCreateSchema = z
  .object({
    image: imageAssetSchema.optional(),
    summary: optionalTrimmedStringSchema,
    points: optionalTrimmedStringArraySchema,
  })
  .strict();

const architectureUpdateSchema = z
  .object({
    summary: optionalTrimmedStringSchema,
    points: optionalTrimmedStringArraySchema,
  })
  .strict();

const slugSchema = z
  .string()
  .trim()
  .regex(slugPattern, "Slug must be lowercase kebab-case");

const monthDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Date must use YYYY-MM format");

const booleanQuerySchema = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean().optional());

export const createProjectSchema = z
  .object({
    title: requiredTrimmedStringSchema,
    slug: slugSchema.optional(),
    shortDescription: requiredTrimmedStringSchema,
    description: requiredTrimmedStringSchema,
    projectType: requiredTrimmedStringSchema,
    status: z.enum(projectStatuses),
    year: z.string().trim().regex(/^\d{4}$/, "Year must be a four-digit string"),
    startDate: monthDateSchema.optional(),
    endDate: monthDateSchema.optional(),
    videoUrl: optionalUrlSchema,
    videoPosterUrl: optionalUrlSchema,
    thumbnail: imageAssetSchema,
    gallery: z.array(imageAssetSchema).min(1),
    architecture: architectureCreateSchema.optional(),
    links: linksSchema.optional(),
    techStack: z.array(techStackItemSchema).min(1),
    overview: trimmedStringArraySchema(1),
    highlights: trimmedStringArraySchema(1),
    challenges: optionalTrimmedStringArraySchema,
    futureImprovements: optionalTrimmedStringArraySchema,
    isFeatured: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  })
  .strict();

export const updateProjectSchema = z
  .object({
    title: requiredTrimmedStringSchema.optional(),
    slug: slugSchema.optional(),
    shortDescription: requiredTrimmedStringSchema.optional(),
    description: requiredTrimmedStringSchema.optional(),
    projectType: requiredTrimmedStringSchema.optional(),
    status: z.enum(projectStatuses).optional(),
    year: z
      .string()
      .trim()
      .regex(/^\d{4}$/, "Year must be a four-digit string")
      .optional(),
    startDate: monthDateSchema.optional(),
    endDate: monthDateSchema.optional(),
    videoUrl: optionalUrlSchema,
    videoPosterUrl: optionalUrlSchema,
    links: linksSchema.optional(),
    techStack: z.array(techStackItemSchema).min(1).optional(),
    overview: trimmedStringArraySchema(1).optional(),
    highlights: trimmedStringArraySchema(1).optional(),
    architecture: architectureUpdateSchema.optional(),
    challenges: optionalTrimmedStringArraySchema,
    futureImprovements: optionalTrimmedStringArraySchema,
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one project field is required",
  });

export const projectIdParamSchema = z.object({
  id: objectIdSchema,
});

export const projectSlugParamSchema = z.object({
  slug: slugSchema,
});

export const galleryImageParamSchema = z.object({
  id: objectIdSchema,
  imageFileId: fileIdSchema,
});

export const toggleFeaturedSchema = z
  .object({
    isFeatured: z.boolean(),
  })
  .strict();

export const toggleVisibilitySchema = z
  .object({
    isVisible: z.boolean(),
  })
  .strict();

export const projectReorderSchema = z
  .object({
    orderedIds: z.array(objectIdSchema).min(1),
  })
  .strict()
  .refine((value) => new Set(value.orderedIds).size === value.orderedIds.length, {
    message: "orderedIds cannot contain duplicates",
  });

export const galleryReorderSchema = z
  .object({
    orderedFileIds: z.array(fileIdSchema).min(1),
  })
  .strict()
  .refine(
    (value) => new Set(value.orderedFileIds).size === value.orderedFileIds.length,
    {
      message: "orderedFileIds cannot contain duplicates",
    },
  );

export const adminProjectQuerySchema = z
  .object({
    search: optionalTrimmedStringSchema,
    status: z.enum(projectStatuses).optional(),
    projectType: optionalTrimmedStringSchema,
    isFeatured: booleanQuerySchema,
    isVisible: booleanQuerySchema,
  })
  .strict();

export const thumbnailUploadBodySchema = z
  .object({
    alt: requiredTrimmedStringSchema,
  })
  .strict();

export const architectureUploadBodySchema = thumbnailUploadBodySchema;
export const galleryUploadBodySchema = thumbnailUploadBodySchema;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AdminProjectQueryInput = z.infer<typeof adminProjectQuerySchema>;
