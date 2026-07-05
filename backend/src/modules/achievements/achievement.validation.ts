import { z } from "zod";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

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

const optionalDateSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date should use YYYY-MM-DD format")
    .optional(),
);

const optionalYearSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Year must be a four-digit string")
    .optional(),
);

const booleanQuerySchema = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean().optional());

export const createAchievementSchema = z
  .object({
    title: requiredTrimmedStringSchema,
    note: requiredTrimmedStringSchema,
    event: optionalTrimmedStringSchema,
    result: optionalTrimmedStringSchema,
    date: optionalDateSchema,
    year: optionalYearSchema,
    icon: optionalTrimmedStringSchema,
    isVisible: z.boolean().optional(),
  })
  .strict();

export const updateAchievementSchema = z
  .object({
    title: requiredTrimmedStringSchema.optional(),
    note: requiredTrimmedStringSchema.optional(),
    event: optionalTrimmedStringSchema,
    result: optionalTrimmedStringSchema,
    date: optionalDateSchema,
    year: optionalYearSchema,
    icon: optionalTrimmedStringSchema,
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one achievement field is required",
  });

export const achievementIdParamSchema = z.object({
  id: objectIdSchema,
});

export const toggleAchievementVisibilitySchema = z
  .object({
    isVisible: z.boolean(),
  })
  .strict();

export const achievementReorderSchema = z
  .object({
    orderedIds: z.array(objectIdSchema).min(1),
  })
  .strict()
  .refine((value) => new Set(value.orderedIds).size === value.orderedIds.length, {
    message: "orderedIds cannot contain duplicates",
  });

export const adminAchievementQuerySchema = z
  .object({
    search: optionalTrimmedStringSchema,
    isVisible: booleanQuerySchema,
  })
  .strict();

export type CreateAchievementInput = z.infer<typeof createAchievementSchema>;
export type UpdateAchievementInput = z.infer<typeof updateAchievementSchema>;
export type AdminAchievementQueryInput = z.infer<
  typeof adminAchievementQuerySchema
>;
