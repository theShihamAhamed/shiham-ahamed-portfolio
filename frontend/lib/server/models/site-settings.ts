import {
  model,
  models,
  Schema,
  type HydratedDocument,
  type Model,
} from "mongoose";

export const siteSettingsSingletonKey = "primary";

export type SiteSettingsEntity = {
  singletonKey: typeof siteSettingsSingletonKey;
  name: string;
  targetRole: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  resumeUrl: string;
  hero: {
    badge: string;
    title: string;
    highlightedPhrase: string;
    description: string;
  };
  education: {
    institution: string;
    degree: string;
    specialization: string;
    expectedGraduation: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

const siteSettingsSchema = new Schema<SiteSettingsEntity>(
  {
    singletonKey: {
      type: String,
      required: true,
      default: siteSettingsSingletonKey,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    targetRole: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    githubUrl: {
      type: String,
      required: true,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      required: true,
      trim: true,
    },
    resumeUrl: {
      type: String,
      required: true,
      trim: true,
    },
    hero: {
      badge: {
        type: String,
        required: true,
        trim: true,
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
      highlightedPhrase: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
        trim: true,
      },
    },
    education: {
      institution: {
        type: String,
        required: true,
        trim: true,
      },
      degree: {
        type: String,
        required: true,
        trim: true,
      },
      specialization: {
        type: String,
        required: true,
        trim: true,
      },
      expectedGraduation: {
        type: String,
        required: true,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

siteSettingsSchema.index({ singletonKey: 1 }, { unique: true });

export type SiteSettingsDocument = HydratedDocument<SiteSettingsEntity>;

export const SiteSettingsModel =
  (models.SiteSettings as Model<SiteSettingsEntity> | undefined) ||
  model<SiteSettingsEntity>("SiteSettings", siteSettingsSchema);
