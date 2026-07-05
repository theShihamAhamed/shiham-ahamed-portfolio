import {
  model,
  models,
  Schema,
  type HydratedDocument,
  type Model,
} from "mongoose";

import {
  imageAssetSchema,
  type ImageAssetEntity,
} from "@/lib/server/models/shared";

export const projectStatuses = ["completed", "in-progress", "planned"] as const;

export type ProjectStatusEntity = (typeof projectStatuses)[number];

export type ProjectTechStackItemEntity = {
  label: string;
  category?: string;
  color?: string;
  showOnCard?: boolean;
};

export type ProjectLinksEntity = {
  github?: string;
  liveDemo?: string;
  article?: string;
};

export type ProjectArchitectureEntity = {
  image?: ImageAssetEntity;
  summary?: string;
  points?: string[];
};

export type ProjectEntity = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  projectType: string;
  status: ProjectStatusEntity;
  year: string;
  startDate?: string;
  endDate?: string;
  videoUrl?: string;
  videoPosterUrl?: string;
  thumbnail: ImageAssetEntity;
  gallery: ImageAssetEntity[];
  architecture?: ProjectArchitectureEntity;
  links?: ProjectLinksEntity;
  techStack: ProjectTechStackItemEntity[];
  overview: string[];
  highlights: string[];
  challenges?: string[];
  futureImprovements?: string[];
  isFeatured: boolean;
  isVisible: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

const projectLinksSchema = new Schema<ProjectLinksEntity>(
  {
    github: { type: String, trim: true },
    liveDemo: { type: String, trim: true },
    article: { type: String, trim: true },
  },
  { _id: false },
);

const projectArchitectureSchema = new Schema<ProjectArchitectureEntity>(
  {
    image: imageAssetSchema,
    summary: { type: String, trim: true },
    points: [{ type: String, trim: true }],
  },
  { _id: false },
);

const techStackItemSchema = new Schema<ProjectTechStackItemEntity>(
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
    },
    overview: {
      type: [{ type: String, trim: true }],
      required: true,
    },
    highlights: {
      type: [{ type: String, trim: true }],
      required: true,
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
