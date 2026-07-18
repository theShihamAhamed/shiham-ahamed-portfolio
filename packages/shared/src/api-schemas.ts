import { z } from "zod";

import { projectStatuses } from "./contracts";
import {
  compareProjectMonths,
  getProjectTimelineIssues,
  isProjectMonth,
} from "./projects/project-dates";
import { PROJECT_TYPE_VALUES } from "./projects/project-types";
import {
  projectArchitecturePointsSchema,
  projectArchitectureSummaryTextSchema,
  projectHighlightsSchema,
  projectOverviewSchema,
  projectShortDescriptionSchema,
} from "./projects/project-content";
import { slugPattern } from "./slug";
import { projectTechnologyListSchema } from "./technologies/technology-schemas";
import { optionalCaseStudyMdxSchema } from "./case-study";

const objectIdSchema = z.string().trim().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");
const fileIdSchema = z.string().trim().min(1, "fileId is required").max(256, "fileId is too long").regex(/^[A-Za-z0-9_-]+$/, "fileId contains invalid characters");
const emptyStringToUndefined = (value: unknown) => typeof value === "string" && value.trim().length === 0 ? undefined : value;
const requiredString = z.string().trim().min(1);
const optionalString = z.preprocess(emptyStringToUndefined, z.string().trim().min(1).optional());
const optionalUrl = (message = "Must be a valid URL", httpOnly = false) => z.preprocess(emptyStringToUndefined, z.string().trim().url(message).refine((value) => !httpOnly || (() => { try { const url = new URL(value); return url.protocol === "http:" || url.protocol === "https:"; } catch { return false; } })(), httpOnly ? "URL must use http or https" : message).optional());
const optionalDate = z.preprocess(emptyStringToUndefined, z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Date should use YYYY-MM-DD format").optional());
const optionalYear = z.preprocess(emptyStringToUndefined, z.string().trim().regex(/^\d{4}$/, "Year must be a four-digit string").optional());
const booleanQuery = z.preprocess((value) => value === "true" ? true : value === "false" ? false : value, z.boolean().optional());
const optionalStringArray = z.array(z.string()).transform((items) => items.map((item) => item.trim()).filter(Boolean)).optional();
const requiredStringArray = z.array(z.string()).transform((items) => items.map((item) => item.trim()).filter(Boolean)).pipe(z.array(requiredString).min(1));
const orderedIdsSchema = z.object({ orderedIds: z.array(objectIdSchema).min(1) }).strict().refine((value) => new Set(value.orderedIds).size === value.orderedIds.length, { message: "orderedIds cannot contain duplicates" });

export const apiImageAssetSchema = z.object({
  url: z.string().trim().url("Image URL must be valid"),
  fileId: fileIdSchema,
  alt: requiredString,
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  name: optionalString,
}).strict();

export const projectStatusSchema = z.enum(projectStatuses);
export const projectTypeSchema = z.enum(PROJECT_TYPE_VALUES);
export const projectMonthSchema = z.string().trim().refine(isProjectMonth, {
  message: "Date must use YYYY-MM format",
});
const projectOptionalUrl = optionalUrl("Must be a valid URL", true);
const projectLinksSchema = z.object({ github: projectOptionalUrl, liveDemo: projectOptionalUrl, article: projectOptionalUrl }).strict();
const projectTechSchema = projectTechnologyListSchema.element;
const optionalProjectArchitectureSummary = z.preprocess(
  emptyStringToUndefined,
  projectArchitectureSummaryTextSchema.optional(),
);
const projectArchitectureCreateSchema = z.object({ image: apiImageAssetSchema.optional(), summary: optionalProjectArchitectureSummary, points: projectArchitecturePointsSchema.optional() }).strict();
const projectArchitectureUpdateSchema = z.object({ summary: optionalProjectArchitectureSummary, points: projectArchitecturePointsSchema.optional() }).strict();
const slugSchema = z.string().trim().regex(slugPattern, "Slug must be lowercase kebab-case");
const optionalProjectMonthSchema = z.preprocess(
  emptyStringToUndefined,
  projectMonthSchema.optional(),
);

export const createProjectSchema = z.object({
  title: requiredString, slug: slugSchema.optional(), shortDescription: projectShortDescriptionSchema,
  projectType: projectTypeSchema, status: projectStatusSchema,
  startDate: projectMonthSchema, endDate: optionalProjectMonthSchema, videoUrl: projectOptionalUrl,
  videoPosterUrl: projectOptionalUrl, thumbnail: apiImageAssetSchema,
  caseStudyMdx: optionalCaseStudyMdxSchema,
  gallery: z.array(apiImageAssetSchema).min(1), architecture: projectArchitectureCreateSchema.optional(),
  links: projectLinksSchema.optional(), techStack: projectTechnologyListSchema,
  overview: projectOverviewSchema, highlights: projectHighlightsSchema, challenges: optionalStringArray,
  futureImprovements: optionalStringArray, isFeatured: z.boolean().optional(), isVisible: z.boolean().optional(),
}).strict().superRefine((value, context) => {
  for (const issue of getProjectTimelineIssues(value)) {
    context.addIssue({ code: "custom", path: [issue.field], message: issue.message });
  }
});

export const updateProjectSchema = z.object({
  title: requiredString.optional(), slug: slugSchema.optional(), shortDescription: projectShortDescriptionSchema.optional(),
  projectType: projectTypeSchema.optional(), status: projectStatusSchema.optional(),
  startDate: projectMonthSchema.optional(), endDate: optionalProjectMonthSchema, videoUrl: projectOptionalUrl,
  videoPosterUrl: projectOptionalUrl, caseStudyMdx: optionalCaseStudyMdxSchema, links: projectLinksSchema.optional(), techStack: projectTechnologyListSchema.optional(),
  overview: projectOverviewSchema.optional(), highlights: projectHighlightsSchema.optional(), architecture: projectArchitectureUpdateSchema.optional(),
  challenges: optionalStringArray, futureImprovements: optionalStringArray,
}).strict().refine((value) => Object.keys(value).length > 0, { message: "At least one project field is required" }).superRefine((value, context) => {
  if (value.startDate && value.endDate && compareProjectMonths(value.endDate, value.startDate) < 0) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "End date cannot be earlier than start date." });
  }

  if (
    value.status === "completed" &&
    Object.prototype.hasOwnProperty.call(value, "endDate") &&
    !value.endDate
  ) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "End date is required for completed projects." });
  }
});

export const projectIdParamSchema = z.object({ id: objectIdSchema });
export const projectSlugParamSchema = z.object({ slug: slugSchema });
export const galleryImageParamSchema = z.object({ id: objectIdSchema, imageFileId: fileIdSchema });
export const toggleFeaturedSchema = z.object({ isFeatured: z.boolean() }).strict();
export const toggleVisibilitySchema = z.object({ isVisible: z.boolean() }).strict();
export const projectReorderSchema = orderedIdsSchema;
export const galleryReorderSchema = z.object({ orderedFileIds: z.array(fileIdSchema).min(1) }).strict().refine((value) => new Set(value.orderedFileIds).size === value.orderedFileIds.length, { message: "orderedFileIds cannot contain duplicates" });
export const adminProjectQuerySchema = z.object({ search: optionalString, status: projectStatusSchema.optional(), projectType: projectTypeSchema.optional(), isFeatured: booleanQuery, isVisible: booleanQuery }).strict();
export const thumbnailUploadBodySchema = z.object({ alt: requiredString }).strict();
export const architectureUploadBodySchema = thumbnailUploadBodySchema;
export const galleryUploadBodySchema = thumbnailUploadBodySchema;

const certificationImageSchema = apiImageAssetSchema;
const certificationOptionalUrl = optionalUrl();
const optionalSkills = optionalStringArray;
export const createCertificationSchema = z.object({ title: requiredString, provider: requiredString, note: requiredString, image: certificationImageSchema, verifyUrl: certificationOptionalUrl, credentialId: optionalString, date: optionalDate, skills: optionalSkills, isVisible: z.boolean().optional() }).strict();
export const updateCertificationSchema = z.object({ title: requiredString.optional(), provider: requiredString.optional(), note: requiredString.optional(), verifyUrl: certificationOptionalUrl, credentialId: optionalString, date: optionalDate, skills: optionalSkills }).strict().refine((value) => Object.keys(value).length > 0, { message: "At least one certification field is required" });
export const certificationIdParamSchema = z.object({ id: objectIdSchema });
export const toggleCertificationVisibilitySchema = z.object({ isVisible: z.boolean() }).strict();
export const certificationReorderSchema = orderedIdsSchema;
export const adminCertificationQuerySchema = z.object({ search: optionalString, isVisible: booleanQuery }).strict();
export const certificationImageUploadBodySchema = z.object({ alt: requiredString }).strict();

export const createAchievementSchema = z.object({ title: requiredString, note: requiredString, event: optionalString, result: optionalString, date: optionalDate, year: optionalYear, icon: optionalString, isVisible: z.boolean().optional() }).strict();
export const updateAchievementSchema = z.object({ title: requiredString.optional(), note: requiredString.optional(), event: optionalString, result: optionalString, date: optionalDate, year: optionalYear, icon: optionalString }).strict().refine((value) => Object.keys(value).length > 0, { message: "At least one achievement field is required" });
export const achievementIdParamSchema = z.object({ id: objectIdSchema });
export const toggleAchievementVisibilitySchema = z.object({ isVisible: z.boolean() }).strict();
export const achievementReorderSchema = orderedIdsSchema;
export const adminAchievementQuerySchema = z.object({ search: optionalString, isVisible: booleanQuery }).strict();

const currentlyBuildingOptionalUrl = optionalUrl();
export const createCurrentlyBuildingSchema = z.object({ title: requiredString, description: requiredString, status: requiredString, currentFocus: requiredString, techStack: requiredStringArray, highlights: requiredStringArray, link: currentlyBuildingOptionalUrl, isVisible: z.boolean().optional() }).strict();
export const updateCurrentlyBuildingSchema = z.object({ title: requiredString.optional(), description: requiredString.optional(), status: requiredString.optional(), currentFocus: requiredString.optional(), techStack: requiredStringArray.optional(), highlights: requiredStringArray.optional(), link: currentlyBuildingOptionalUrl }).strict().refine((value) => Object.keys(value).length > 0, { message: "At least one currently-building field is required" });
export const currentlyBuildingIdParamSchema = z.object({ id: objectIdSchema });
export const toggleCurrentlyBuildingVisibilitySchema = z.object({ isVisible: z.boolean() }).strict();
export const currentlyBuildingReorderSchema = orderedIdsSchema;
export const adminCurrentlyBuildingQuerySchema = z.object({ search: optionalString, status: optionalString, isVisible: booleanQuery }).strict();

const requiredMessage = (message: string) => z.string().trim().min(1, message);
const settingsHeroSchema = z.object({ badge: requiredMessage("Hero badge is required"), title: requiredMessage("Hero title is required"), highlightedPhrase: requiredMessage("Hero highlighted phrase is required"), description: requiredMessage("Hero description is required") }).strict();
const settingsEducationSchema = z.object({ institution: requiredMessage("Education institution is required"), degree: requiredMessage("Education degree is required"), specialization: requiredMessage("Education specialization is required"), expectedGraduation: requiredMessage("Expected graduation is required") }).strict();
export const updateSiteSettingsSchema = z.object({ name: requiredMessage("Name is required"), targetRole: requiredMessage("Target role is required"), email: z.string().trim().email("Email must be valid"), githubUrl: z.string().trim().url("GitHub URL must be valid"), linkedinUrl: z.string().trim().url("LinkedIn URL must be valid"), resumeUrl: z.string().trim().url("Resume URL must be valid"), hero: settingsHeroSchema, education: settingsEducationSchema }).strict();

export type AdminProjectQueryInput = z.infer<typeof adminProjectQuerySchema>;
export type AdminCertificationQueryInput = z.infer<typeof adminCertificationQuerySchema>;
export type AdminAchievementQueryInput = z.infer<typeof adminAchievementQuerySchema>;
export type AdminCurrentlyBuildingQueryInput = z.infer<typeof adminCurrentlyBuildingQuerySchema>;
