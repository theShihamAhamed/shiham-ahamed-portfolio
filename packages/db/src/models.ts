import { model, models, Schema, type HydratedDocument, type Model } from "mongoose";
import { CASE_STUDY_MDX_MAX_BYTES, getCaseStudyMdxValidationIssues, getProjectTimelineIssues, getUtf8ByteLength, isProjectMonth, PROJECT_CONTENT_LIMITS, PROJECT_TYPE_VALUES, projectStatuses, projectTechnologyListSchema, siteSettingsSingletonKey } from "@portfolio/shared";
import type { AchievementEntity, CertificationEntity, CurrentlyBuildingEntity, ProjectEntity, SiteSettingsEntity } from "./types";

export const imageAssetSchema = new Schema({ url: { type: String, required: true, trim: true }, fileId: { type: String, required: true, trim: true }, alt: { type: String, required: true, trim: true }, width: { type: Number, min: 1 }, height: { type: Number, min: 1 }, name: { type: String, trim: true } }, { _id: false });
const linksSchema = new Schema({ github: { type: String, trim: true }, liveDemo: { type: String, trim: true }, article: { type: String, trim: true } }, { _id: false });
const architectureSchema = new Schema({
  image: imageAssetSchema,
  summary: {
    type: String,
    trim: true,
    maxlength: [PROJECT_CONTENT_LIMITS.architectureSummary.maxCharacters, `Architecture summary must be ${PROJECT_CONTENT_LIMITS.architectureSummary.maxCharacters} characters or fewer.`],
  },
  points: {
    type: [{
      type: String,
      required: [true, "Architecture point cannot be empty."],
      trim: true,
      maxlength: [PROJECT_CONTENT_LIMITS.architecturePoints.maxCharactersPerItem, `Architecture point must be ${PROJECT_CONTENT_LIMITS.architecturePoints.maxCharactersPerItem} characters or fewer.`],
    }],
    validate: {
      validator: (value: unknown[]) => Array.isArray(value) && value.length <= PROJECT_CONTENT_LIMITS.architecturePoints.maxItems,
      message: `Architecture can contain at most ${PROJECT_CONTENT_LIMITS.architecturePoints.maxItems} points.`,
    },
  },
}, { _id: false });
const techSchema = new Schema({ kind: { type: String, enum: ["known", "custom"], required: true }, slug: { type: String, required: true, trim: true }, label: { type: String, trim: true }, category: { type: String, trim: true }, color: { type: String, trim: true, match: /^#[0-9a-fA-F]{6}$/ }, showOnCard: { type: Boolean, required: true, default: false } }, { _id: false, strict: "throw" });
const nonempty = (message: string) => ({ validator: (value: unknown[]) => Array.isArray(value) && value.length > 0, message });
const atMost = (maximum: number, message: string) => ({ validator: (value: unknown[]) => Array.isArray(value) && value.length <= maximum, message });
const emptyStringToUndefined = (value: unknown) => typeof value === "string" && value.trim().length === 0 ? undefined : value;
const normalizeStringList = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean) : value;

export const projectSchema = new Schema<ProjectEntity>({
  title: { type: String, required: true, trim: true }, slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  shortDescription: { type: String, required: true, trim: true, maxlength: [PROJECT_CONTENT_LIMITS.shortDescription.maxCharacters, `Card description must be ${PROJECT_CONTENT_LIMITS.shortDescription.maxCharacters} characters or fewer.`] }, projectType: { type: String, enum: PROJECT_TYPE_VALUES, required: true, trim: true },
  status: { type: String, enum: projectStatuses, required: true }, startDate: { type: String, required: true, trim: true, validate: { validator: isProjectMonth, message: "Start date must use YYYY-MM format." } }, endDate: { type: String, trim: true, set: (value: unknown) => typeof value === "string" && value.trim().length === 0 ? undefined : value, validate: { validator: (value: unknown) => value === undefined || isProjectMonth(value), message: "End date must use YYYY-MM format." } },
  videoUrl: { type: String, trim: true }, videoPosterUrl: { type: String, trim: true }, caseStudyMdx: { type: String, trim: true, set: (value: unknown) => typeof value === "string" && value.trim().length === 0 ? undefined : value, validate: { validator: (value: unknown) => value === undefined || (typeof value === "string" && getCaseStudyMdxValidationIssues(value).length === 0), message: `Case study content must be valid restricted Markdown and at most ${CASE_STUDY_MDX_MAX_BYTES} UTF-8 bytes.` } }, thumbnail: { type: imageAssetSchema, required: true },
  gallery: { type: [imageAssetSchema], required: true, validate: nonempty("A project must have at least one gallery image") }, architecture: { type: architectureSchema, default: undefined }, links: { type: linksSchema, default: undefined },
  techStack: { type: [techSchema], required: true, validate: [{ validator: (value: unknown[]) => Array.isArray(value) && value.length > 0, message: "A project must have at least one tech stack item" }, { validator: (value: unknown[]) => projectTechnologyListSchema.safeParse(value.map((item: any) => typeof item?.toObject === "function" ? item.toObject() : item)).success, message: "Technology stack contains invalid or duplicate items" }] }, overview: { type: [{ type: String, required: [true, "Overview paragraph cannot be empty."], trim: true, maxlength: [PROJECT_CONTENT_LIMITS.overview.maxCharactersPerItem, `Overview paragraph must be ${PROJECT_CONTENT_LIMITS.overview.maxCharactersPerItem} characters or fewer.`] }], required: true, validate: [nonempty("Add at least 1 overview paragraph."), atMost(PROJECT_CONTENT_LIMITS.overview.maxItems, `Overview can contain at most ${PROJECT_CONTENT_LIMITS.overview.maxItems} paragraphs.`)] },
  highlights: { type: [{ type: String, required: [true, "Highlight cannot be empty."], trim: true, maxlength: [PROJECT_CONTENT_LIMITS.highlights.maxCharactersPerItem, `Highlight must be ${PROJECT_CONTENT_LIMITS.highlights.maxCharactersPerItem} characters or fewer.`] }], required: true, validate: [nonempty("Add at least 1 highlight."), atMost(PROJECT_CONTENT_LIMITS.highlights.maxItems, `Highlights can contain at most ${PROJECT_CONTENT_LIMITS.highlights.maxItems} items.`)] }, challenges: [{ type: String, trim: true }], futureImprovements: [{ type: String, trim: true }],
  isFeatured: { type: Boolean, default: false }, isVisible: { type: Boolean, default: true }, displayOrder: { type: Number, required: true },
}, { timestamps: true, versionKey: false });
projectSchema.pre("validate", function () {
  for (const issue of getProjectTimelineIssues({
    status: this.status,
    startDate: this.startDate,
    endDate: this.endDate,
  })) {
    this.invalidate(issue.field, issue.message);
  }
});
projectSchema.index({ displayOrder: 1 }); projectSchema.index({ isVisible: 1, displayOrder: 1 }); projectSchema.index({ isFeatured: 1, isVisible: 1, displayOrder: 1 }); projectSchema.index({ projectType: 1 }); projectSchema.index({ status: 1 });

export const certificationSchema = new Schema<CertificationEntity>({ title: { type: String, required: true, trim: true }, provider: { type: String, required: true, trim: true }, note: { type: String, required: true, trim: true }, image: { type: imageAssetSchema, required: true }, verifyUrl: { type: String, trim: true }, credentialId: { type: String, trim: true }, date: { type: String, trim: true }, skills: { type: [{ type: String, trim: true }], default: undefined }, isVisible: { type: Boolean, default: true }, displayOrder: { type: Number, required: true } }, { timestamps: true, versionKey: false });
certificationSchema.index({ displayOrder: 1 }); certificationSchema.index({ isVisible: 1, displayOrder: 1 }); certificationSchema.index({ title: 1 }); certificationSchema.index({ provider: 1 });

export const achievementSchema = new Schema<AchievementEntity>({ title: { type: String, required: true, trim: true }, note: { type: String, required: true, trim: true }, event: { type: String, trim: true }, result: { type: String, trim: true }, date: { type: String, trim: true }, year: { type: String, trim: true }, icon: { type: String, trim: true }, isVisible: { type: Boolean, default: true }, displayOrder: { type: Number, required: true } }, { timestamps: true, versionKey: false });
achievementSchema.index({ displayOrder: 1 }); achievementSchema.index({ isVisible: 1, displayOrder: 1 }); achievementSchema.index({ title: 1 }); achievementSchema.index({ year: 1 });

export const currentlyBuildingSchema = new Schema<CurrentlyBuildingEntity>({ title: { type: String, required: true, trim: true }, description: { type: String, required: true, trim: true }, currentFocus: { type: String, trim: true, set: emptyStringToUndefined }, techStack: { type: [{ type: String, trim: true }], default: [], set: normalizeStringList }, highlights: { type: [{ type: String, trim: true }], default: [], set: normalizeStringList }, link: { type: String, trim: true, set: emptyStringToUndefined }, isVisible: { type: Boolean, default: true }, displayOrder: { type: Number, required: true } }, { timestamps: true, versionKey: false });
currentlyBuildingSchema.index({ displayOrder: 1 }); currentlyBuildingSchema.index({ isVisible: 1, displayOrder: 1 });

export const siteSettingsSchema = new Schema<SiteSettingsEntity>({ singletonKey: { type: String, required: true, unique: true, default: siteSettingsSingletonKey }, name: { type: String, required: true, trim: true }, targetRole: { type: String, required: true, trim: true }, email: { type: String, required: true, trim: true }, githubUrl: { type: String, required: true, trim: true }, linkedinUrl: { type: String, required: true, trim: true }, resumeUrl: { type: String, required: true, trim: true }, hero: { badge: { type: String, required: true, trim: true }, title: { type: String, required: true, trim: true }, highlightedPhrase: { type: String, required: true, trim: true }, description: { type: String, required: true, trim: true } }, education: { institution: { type: String, required: true, trim: true }, degree: { type: String, required: true, trim: true }, specialization: { type: String, required: true, trim: true }, expectedGraduation: { type: String, required: true, trim: true } } }, { timestamps: true, versionKey: false });
siteSettingsSchema.index({ singletonKey: 1 }, { unique: true });

export type ProjectDocument = HydratedDocument<ProjectEntity>; export type CertificationDocument = HydratedDocument<CertificationEntity>; export type AchievementDocument = HydratedDocument<AchievementEntity>; export type CurrentlyBuildingDocument = HydratedDocument<CurrentlyBuildingEntity>; export type SiteSettingsDocument = HydratedDocument<SiteSettingsEntity>;
export const ProjectModel = (models.Project as Model<ProjectEntity> | undefined) || model<ProjectEntity>("Project", projectSchema);
export const CertificationModel = (models.Certification as Model<CertificationEntity> | undefined) || model<CertificationEntity>("Certification", certificationSchema);
export const AchievementModel = (models.Achievement as Model<AchievementEntity> | undefined) || model<AchievementEntity>("Achievement", achievementSchema);
export const CurrentlyBuildingModel = (models.CurrentlyBuilding as Model<CurrentlyBuildingEntity> | undefined) || model<CurrentlyBuildingEntity>("CurrentlyBuilding", currentlyBuildingSchema);
export const SiteSettingsModel = (models.SiteSettings as Model<SiteSettingsEntity> | undefined) || model<SiteSettingsEntity>("SiteSettings", siteSettingsSchema);
