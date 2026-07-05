import { z } from "zod";

const requiredTrimmedString = (message: string) =>
  z.string().trim().min(1, message);

const clearableOptionalUrl = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) {
      return true;
    }

    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }, "Enter a valid URL.");

const trimmedStringList = z
  .array(z.string())
  .transform((items) => items.map((item) => item.trim()).filter(Boolean));

const requiredStringList = (message: string) =>
  trimmedStringList.pipe(z.array(z.string().min(1)).min(1, message));

const currentlyBuildingBaseSchema = z.object({
  title: requiredTrimmedString("Title is required."),
  description: requiredTrimmedString("Description is required."),
  status: requiredTrimmedString("Status is required."),
  currentFocus: requiredTrimmedString("Current focus is required."),
  techStack: requiredStringList("At least one tech stack item is required."),
  highlights: requiredStringList("At least one highlight is required."),
  link: clearableOptionalUrl,
});

export const createCurrentlyBuildingFormSchema =
  currentlyBuildingBaseSchema.extend({
    isVisible: z.boolean(),
  });

export const updateCurrentlyBuildingFormSchema = currentlyBuildingBaseSchema;

export type CreateCurrentlyBuildingFormValues = z.input<
  typeof createCurrentlyBuildingFormSchema
>;
export type ParsedCreateCurrentlyBuildingFormValues = z.output<
  typeof createCurrentlyBuildingFormSchema
>;
export type UpdateCurrentlyBuildingFormValues = z.input<
  typeof updateCurrentlyBuildingFormSchema
>;
export type ParsedUpdateCurrentlyBuildingFormValues = z.output<
  typeof updateCurrentlyBuildingFormSchema
>;
