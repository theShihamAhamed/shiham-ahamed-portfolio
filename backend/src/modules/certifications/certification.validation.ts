import { z } from "zod";

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

const requiredTrimmedStringSchema = z.string().trim().min(1);

const optionalTrimmedStringSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1).optional(),
);

const optionalUrlSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().url("Must be a valid URL").optional(),
);

const optionalDateSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date should use YYYY-MM-DD format")
    .optional(),
);

const optionalSkillsSchema = z
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

const booleanQuerySchema = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean().optional());

export const createCertificationSchema = z
  .object({
    title: requiredTrimmedStringSchema,
    provider: requiredTrimmedStringSchema,
    note: requiredTrimmedStringSchema,
    image: imageAssetSchema,
    verifyUrl: optionalUrlSchema,
    credentialId: optionalTrimmedStringSchema,
    date: optionalDateSchema,
    skills: optionalSkillsSchema,
    isVisible: z.boolean().optional(),
  })
  .strict();

export const updateCertificationSchema = z
  .object({
    title: requiredTrimmedStringSchema.optional(),
    provider: requiredTrimmedStringSchema.optional(),
    note: requiredTrimmedStringSchema.optional(),
    verifyUrl: optionalUrlSchema,
    credentialId: optionalTrimmedStringSchema,
    date: optionalDateSchema,
    skills: optionalSkillsSchema,
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one certification field is required",
  });

export const certificationIdParamSchema = z.object({
  id: objectIdSchema,
});

export const toggleCertificationVisibilitySchema = z
  .object({
    isVisible: z.boolean(),
  })
  .strict();

export const certificationReorderSchema = z
  .object({
    orderedIds: z.array(objectIdSchema).min(1),
  })
  .strict()
  .refine((value) => new Set(value.orderedIds).size === value.orderedIds.length, {
    message: "orderedIds cannot contain duplicates",
  });

export const adminCertificationQuerySchema = z
  .object({
    search: optionalTrimmedStringSchema,
    isVisible: booleanQuerySchema,
  })
  .strict();

export const certificationImageUploadBodySchema = z
  .object({
    alt: requiredTrimmedStringSchema,
  })
  .strict();

export type CreateCertificationInput = z.infer<
  typeof createCertificationSchema
>;
export type UpdateCertificationInput = z.infer<
  typeof updateCertificationSchema
>;
export type AdminCertificationQueryInput = z.infer<
  typeof adminCertificationQuerySchema
>;
