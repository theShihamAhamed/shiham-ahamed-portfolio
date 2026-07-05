import { z } from "zod";

const requiredTrimmedString = (message: string) =>
  z.string().trim().min(1, message);

const optionalDate = z
  .string()
  .trim()
  .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Use YYYY-MM-DD format.",
  });

const optionalYear = z
  .string()
  .trim()
  .refine((value) => !value || /^\d{4}$/.test(value), {
    message: "Year must be a four-digit string.",
  });

const achievementBaseSchema = z.object({
  title: requiredTrimmedString("Title is required."),
  note: requiredTrimmedString("Note is required."),
  event: z.string().trim(),
  result: z.string().trim(),
  date: optionalDate,
  year: optionalYear,
  icon: z.string().trim(),
});

export const createAchievementFormSchema = achievementBaseSchema.extend({
  isVisible: z.boolean(),
});

export const updateAchievementFormSchema = achievementBaseSchema;

export type CreateAchievementFormValues = z.input<
  typeof createAchievementFormSchema
>;
export type ParsedCreateAchievementFormValues = z.output<
  typeof createAchievementFormSchema
>;
export type UpdateAchievementFormValues = z.input<
  typeof updateAchievementFormSchema
>;
export type ParsedUpdateAchievementFormValues = z.output<
  typeof updateAchievementFormSchema
>;
