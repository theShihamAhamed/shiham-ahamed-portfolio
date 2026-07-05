import {
  model,
  models,
  Schema,
  type HydratedDocument,
  type Model,
} from "mongoose";

import type { ProjectEntity } from "./project.types";
import { projectStatuses } from "./project.types";

const imageAssetSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    fileId: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      required: true,
      trim: true,
    },
    width: {
      type: Number,
      min: 1,
    },
    height: {
      type: Number,
      min: 1,
    },
    name: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const projectLinksSchema = new Schema(
  {
    github: { type: String, trim: true },
    liveDemo: { type: String, trim: true },
    article: { type: String, trim: true },
  },
  { _id: false },
);

const projectArchitectureSchema = new Schema(
  {
    image: imageAssetSchema,
    summary: { type: String, trim: true },
    points: [{ type: String, trim: true }],
  },
  { _id: false },
);

const techStackItemSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    showOnCard: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const projectSchema = new Schema<ProjectEntity>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    projectType: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: projectStatuses,
      required: true,
    },
    year: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: String,
      trim: true,
    },
    endDate: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    videoPosterUrl: {
      type: String,
      trim: true,
    },
    thumbnail: {
      type: imageAssetSchema,
      required: true,
    },
    gallery: {
      type: [imageAssetSchema],
      required: true,
      validate: {
        validator(value: unknown[]) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "A project must have at least one gallery image",
      },
    },
    architecture: {
      type: projectArchitectureSchema,
      default: undefined,
    },
    links: {
      type: projectLinksSchema,
      default: undefined,
    },
    techStack: {
      type: [techStackItemSchema],
      required: true,
      validate: {
        validator(value: unknown[]) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "A project must have at least one tech stack item",
      },
    },
    overview: {
      type: [{ type: String, trim: true }],
      required: true,
      validate: {
        validator(value: unknown[]) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "A project must have at least one overview paragraph",
      },
    },
    highlights: {
      type: [{ type: String, trim: true }],
      required: true,
      validate: {
        validator(value: unknown[]) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "A project must have at least one highlight",
      },
    },
    challenges: [{ type: String, trim: true }],
    futureImprovements: [{ type: String, trim: true }],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

projectSchema.index({ displayOrder: 1 });
projectSchema.index({ isVisible: 1, displayOrder: 1 });
projectSchema.index({ isFeatured: 1, isVisible: 1, displayOrder: 1 });
projectSchema.index({ projectType: 1 });
projectSchema.index({ status: 1 });

export type ProjectDocument = HydratedDocument<ProjectEntity>;

export const ProjectModel =
  (models.Project as Model<ProjectEntity> | undefined) ||
  model<ProjectEntity>("Project", projectSchema);
