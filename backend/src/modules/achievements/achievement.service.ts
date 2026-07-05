import mongoose, { type ClientSession } from "mongoose";

import { AppError } from "../../utils/app-error";
import { escapeRegExp } from "../../utils/query";
import {
  AchievementModel,
  type AchievementDocument,
} from "./achievement.model";
import type {
  AdminAchievementQueryInput,
  CreateAchievementInput,
  UpdateAchievementInput,
} from "./achievement.validation";

const transactionUnsupportedMessageParts = [
  "Transaction numbers are only allowed",
  "replica set member or mongos",
  "Transaction is not supported",
  "does not support retryable writes",
];

const isTransactionUnsupportedError = (error: unknown): boolean => {
  return (
    error instanceof Error &&
    transactionUnsupportedMessageParts.some((message) =>
      error.message.includes(message),
    )
  );
};

const runWithOptionalTransaction = async <T>(
  operation: (session?: ClientSession) => Promise<T>,
): Promise<T> => {
  const session = await mongoose.startSession();

  try {
    let result: T | undefined;

    try {
      await session.withTransaction(async () => {
        result = await operation(session);
      });

      return result as T;
    } catch (error) {
      if (isTransactionUnsupportedError(error)) {
        console.warn(
          "MongoDB transactions are unavailable; retrying operation without a transaction.",
        );
        return operation();
      }

      throw error;
    }
  } finally {
    await session.endSession();
  }
};

const requireAchievement = async (
  id: string,
): Promise<AchievementDocument> => {
  const achievement = await AchievementModel.findById(id).exec();

  if (!achievement) {
    throw new AppError("Achievement not found", 404, "ACHIEVEMENT_NOT_FOUND");
  }

  return achievement;
};

const getNextDisplayOrder = async (): Promise<number> => {
  const latestAchievement = await AchievementModel.findOne()
    .sort({ displayOrder: -1 })
    .select("displayOrder")
    .exec();

  return (latestAchievement?.displayOrder ?? 0) + 1;
};

const buildAchievementFilter = (
  query: AdminAchievementQueryInput,
): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};

  if (query.search) {
    const searchRegex = new RegExp(escapeRegExp(query.search), "i");
    filter.$or = [
      { title: searchRegex },
      { note: searchRegex },
      { event: searchRegex },
      { result: searchRegex },
      { year: searchRegex },
      { icon: searchRegex },
    ];
  }

  if (typeof query.isVisible === "boolean") {
    filter.isVisible = query.isVisible;
  }

  return filter;
};

export const getAdminAchievements = async (
  query: AdminAchievementQueryInput,
): Promise<AchievementDocument[]> => {
  return AchievementModel.find(buildAchievementFilter(query))
    .sort({ displayOrder: 1, createdAt: -1 })
    .exec();
};

export const getAdminAchievementById = async (
  id: string,
): Promise<AchievementDocument> => {
  return requireAchievement(id);
};

export const getVisibleAchievements = async (): Promise<
  AchievementDocument[]
> => {
  return AchievementModel.find({ isVisible: true })
    .sort({ displayOrder: 1, createdAt: -1 })
    .exec();
};

export const createAchievement = async (
  input: CreateAchievementInput,
): Promise<AchievementDocument> => {
  return AchievementModel.create({
    ...input,
    isVisible: input.isVisible ?? true,
    displayOrder: await getNextDisplayOrder(),
  });
};

export const updateAchievement = async (
  id: string,
  input: UpdateAchievementInput,
): Promise<AchievementDocument> => {
  const achievement = await requireAchievement(id);

  achievement.set(input);
  await achievement.save();

  return achievement;
};

export const deleteAchievement = async (
  id: string,
): Promise<AchievementDocument> => {
  const achievement = await AchievementModel.findByIdAndDelete(id).exec();

  if (!achievement) {
    throw new AppError("Achievement not found", 404, "ACHIEVEMENT_NOT_FOUND");
  }

  return achievement;
};

export const toggleAchievementVisibility = async (
  id: string,
  isVisible: boolean,
): Promise<AchievementDocument> => {
  const achievement = await requireAchievement(id);

  achievement.isVisible = isVisible;
  await achievement.save();

  return achievement;
};

export const reorderAchievements = async (
  orderedIds: string[],
): Promise<AchievementDocument[]> => {
  const existingAchievements = await AchievementModel.find({
    _id: { $in: orderedIds },
  })
    .select("_id")
    .exec();

  if (existingAchievements.length !== orderedIds.length) {
    throw new AppError(
      "All orderedIds must belong to existing achievements",
      404,
      "ACHIEVEMENT_REORDER_IDS_NOT_FOUND",
    );
  }

  const totalAchievements = await AchievementModel.countDocuments();

  if (orderedIds.length !== totalAchievements) {
    throw new AppError(
      "orderedIds must include every achievement exactly once",
      422,
      "ACHIEVEMENT_REORDER_INCOMPLETE",
    );
  }

  await runWithOptionalTransaction((session) =>
    AchievementModel.bulkWrite(
      orderedIds.map((achievementId, index) => ({
        updateOne: {
          filter: { _id: achievementId },
          update: { $set: { displayOrder: index + 1 } },
        },
      })),
      { session },
    ),
  );

  return AchievementModel.find()
    .sort({ displayOrder: 1, createdAt: -1 })
    .exec();
};
