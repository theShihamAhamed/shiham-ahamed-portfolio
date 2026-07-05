import {
  model,
  models,
  Schema,
  type HydratedDocument,
  type Model,
} from "mongoose";

import type { AchievementEntity } from "./achievement.types";

const achievementSchema = new Schema<AchievementEntity>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      required: true,
      trim: true,
    },
    event: {
      type: String,
      trim: true,
    },
    result: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      trim: true,
    },
    year: {
      type: String,
      trim: true,
    },
    icon: {
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

achievementSchema.index({ displayOrder: 1 });
achievementSchema.index({ isVisible: 1, displayOrder: 1 });
achievementSchema.index({ title: 1 });
achievementSchema.index({ year: 1 });

export type AchievementDocument = HydratedDocument<AchievementEntity>;

export const AchievementModel =
  (models.Achievement as Model<AchievementEntity> | undefined) ||
  model<AchievementEntity>("Achievement", achievementSchema);
