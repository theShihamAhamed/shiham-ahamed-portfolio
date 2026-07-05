import {
  model,
  models,
  Schema,
  type HydratedDocument,
  type Model,
} from "mongoose";

export type CurrentlyBuildingEntity = {
  title: string;
  description: string;
  status: string;
  currentFocus: string;
  techStack: string[];
  highlights: string[];
  link?: string;
  isVisible: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

const currentlyBuildingSchema = new Schema<CurrentlyBuildingEntity>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    currentFocus: {
      type: String,
      required: true,
      trim: true,
    },
    techStack: {
      type: [{ type: String, trim: true }],
      required: true,
    },
    highlights: {
      type: [{ type: String, trim: true }],
      required: true,
    },
    link: {
      type: String,
      trim: true,
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

currentlyBuildingSchema.index({ displayOrder: 1 });
currentlyBuildingSchema.index({ isVisible: 1, displayOrder: 1 });
currentlyBuildingSchema.index({ status: 1 });

export type CurrentlyBuildingDocument =
  HydratedDocument<CurrentlyBuildingEntity>;

export const CurrentlyBuildingModel =
  (models.CurrentlyBuilding as Model<CurrentlyBuildingEntity> | undefined) ||
  model<CurrentlyBuildingEntity>(
    "CurrentlyBuilding",
    currentlyBuildingSchema,
  );

