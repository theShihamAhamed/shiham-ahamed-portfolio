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

const optionalDate = z
  .string()
  .trim()
  .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Use YYYY-MM-DD format.",
  });

const trimmedStringList = z
  .array(z.string())
  .transform((items) => items.map((item) => item.trim()).filter(Boolean));

const uploadedImageSchema = z.object({
  url: z.string().trim().url("Image URL must be valid."),
  fileId: requiredTrimmedString("Uploaded image fileId is required."),
  alt: requiredTrimmedString("Image alt text is required."),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  name: z.string().trim().optional(),
});

const certificationBaseSchema = z.object({
  title: requiredTrimmedString("Title is required."),
  provider: requiredTrimmedString("Provider is required."),
  note: requiredTrimmedString("Note is required."),
  verifyUrl: clearableOptionalUrl,
  credentialId: z.string().trim(),
  date: optionalDate,
  skills: trimmedStringList,
});

export const createCertificationFormSchema = certificationBaseSchema.extend({
  image: uploadedImageSchema.optional().superRefine((value, context) => {
    if (!value) {
      context.addIssue({
        code: "custom",
        message: "Certification image is required.",
      });
    }
  }),
  isVisible: z.boolean(),
});

export const updateCertificationFormSchema = certificationBaseSchema;

export type CreateCertificationFormValues = z.input<
  typeof createCertificationFormSchema
>;
export type ParsedCreateCertificationFormValues = z.output<
  typeof createCertificationFormSchema
>;
export type UpdateCertificationFormValues = z.input<
  typeof updateCertificationFormSchema
>;
export type ParsedUpdateCertificationFormValues = z.output<
  typeof updateCertificationFormSchema
>;
