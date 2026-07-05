import {
  model,
  models,
  Schema,
  type HydratedDocument,
  type Model,
} from "mongoose";

import type { SiteSettingsEntity } from "./site-settings.types";
import { siteSettingsSingletonKey } from "./site-settings.types";

const siteSettingsSchema = new Schema<SiteSettingsEntity>(
  {
    singletonKey: {
      type: String,
      required: true,
      unique: true,
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
