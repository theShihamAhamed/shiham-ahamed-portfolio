import {
  model,
  models,
  Schema,
  type HydratedDocument,
  type Model,
} from "mongoose";

import type { CurrentlyBuildingEntity } from "./currently-building.types";

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
      validate: {
        validator(value: unknown[]) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "A currently-building item must have at least one tech stack item",
      },
    },
    highlights: {
      type: [{ type: String, trim: true }],
      required: true,
      validate: {
        validator(value: unknown[]) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "A currently-building item must have at least one highlight",
      },
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
