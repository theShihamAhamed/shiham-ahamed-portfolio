import { z } from "zod";

export const CASE_STUDY_MDX_MAX_BYTES = 100_000;

export type CaseStudyMdxValidationIssue = {
  code: "too_large" | "unsafe_syntax";
  message: string;
};

export const getUtf8ByteLength = (value: string): number =>
  new TextEncoder().encode(value).length;

export const normalizeCaseStudyMdx = (
  value: unknown,
): string | undefined => {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const unsafeCaseStudyPatterns: Array<[RegExp, string]> = [
  [/^\s*(?:import|export)\s+/m, "Imports and exports are not allowed."],
  [/<\s*(?:script|style|iframe|object|embed|form|input|button|textarea|svg)\b/i, "Executable or interactive HTML is not allowed."],
  [/<\s*\/?[A-Za-z][^>]*>/, "HTML and custom JSX are not allowed."],
  [/(?:^|[\s(])javascript\s*:/i, "javascript: URLs are not allowed."],
  [/\bon[a-z]+\s*=\s*/i, "Inline event handlers are not allowed."],
];

export const getCaseStudyMdxValidationIssues = (
  value: unknown,
): CaseStudyMdxValidationIssue[] => {
  const normalized = normalizeCaseStudyMdx(value);
  if (!normalized) return [];

  const issues: CaseStudyMdxValidationIssue[] = [];

  if (getUtf8ByteLength(normalized) > CASE_STUDY_MDX_MAX_BYTES) {
    issues.push({
      code: "too_large",
      message: `Case study content must be at most ${CASE_STUDY_MDX_MAX_BYTES} UTF-8 bytes.`,
    });
  }

  for (const [pattern, message] of unsafeCaseStudyPatterns) {
    if (pattern.test(normalized)) {
      issues.push({ code: "unsafe_syntax", message });
    }
  }

  return issues;
};

export const caseStudyMdxSchema = z.string().trim().superRefine((value, context) => {
  for (const issue of getCaseStudyMdxValidationIssues(value)) {
    context.addIssue({ code: "custom", message: issue.message });
  }
});

export const optionalCaseStudyMdxSchema = z.preprocess(
  normalizeCaseStudyMdx,
  caseStudyMdxSchema.optional(),
);
