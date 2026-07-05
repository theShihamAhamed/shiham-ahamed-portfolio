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

const optionalUrlSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().url("Must be a valid URL").optional(),
);

const trimmedStringArraySchema = z
  .array(z.string())
  .transform((items) => items.map((item) => item.trim()).filter(Boolean))
  .pipe(z.array(requiredTrimmedStringSchema).min(1));

const booleanQuerySchema = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean().optional());

export const createCurrentlyBuildingSchema = z
  .object({
    title: requiredTrimmedStringSchema,
    description: requiredTrimmedStringSchema,
    status: requiredTrimmedStringSchema,
    currentFocus: requiredTrimmedStringSchema,
    techStack: trimmedStringArraySchema,
    highlights: trimmedStringArraySchema,
    link: optionalUrlSchema,
    isVisible: z.boolean().optional(),
  })
  .strict();

export const updateCurrentlyBuildingSchema = z
  .object({
    title: requiredTrimmedStringSchema.optional(),
    description: requiredTrimmedStringSchema.optional(),
    status: requiredTrimmedStringSchema.optional(),
    currentFocus: requiredTrimmedStringSchema.optional(),
    techStack: trimmedStringArraySchema.optional(),
    highlights: trimmedStringArraySchema.optional(),
    link: optionalUrlSchema,
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one currently-building field is required",
  });

export const currentlyBuildingIdParamSchema = z.object({
  id: objectIdSchema,
});

export const toggleCurrentlyBuildingVisibilitySchema = z
  .object({
    isVisible: z.boolean(),
  })
  .strict();

export const currentlyBuildingReorderSchema = z
  .object({
    orderedIds: z.array(objectIdSchema).min(1),
  })
  .strict()
  .refine((value) => new Set(value.orderedIds).size === value.orderedIds.length, {
    message: "orderedIds cannot contain duplicates",
  });

export const adminCurrentlyBuildingQuerySchema = z
  .object({
    search: optionalTrimmedStringSchema,
    status: optionalTrimmedStringSchema,
    isVisible: booleanQuerySchema,
  })
  .strict();

export type CreateCurrentlyBuildingInput = z.infer<
  typeof createCurrentlyBuildingSchema
>;
export type UpdateCurrentlyBuildingInput = z.infer<
  typeof updateCurrentlyBuildingSchema
>;
export type AdminCurrentlyBuildingQueryInput = z.infer<
  typeof adminCurrentlyBuildingQuerySchema
>;
