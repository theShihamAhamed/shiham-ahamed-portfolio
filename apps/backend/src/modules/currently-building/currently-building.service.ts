import { mongoose, type ClientSession } from "@portfolio/db";

import { AppError } from "../../utils/app-error";
import { escapeRegExp } from "../../utils/query";
import {
  CurrentlyBuildingModel,
  type CurrentlyBuildingDocument,
} from "./currently-building.model";
import type {
  AdminCurrentlyBuildingQueryInput,
  CreateCurrentlyBuildingInput,
  UpdateCurrentlyBuildingInput,
} from "./currently-building.validation";

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

const requireCurrentlyBuildingItem = async (
  id: string,
): Promise<CurrentlyBuildingDocument> => {
  const item = await CurrentlyBuildingModel.findById(id).exec();

  if (!item) {
    throw new AppError(
      "Currently-building item not found",
      404,
      "CURRENTLY_BUILDING_ITEM_NOT_FOUND",
    );
  }

  return item;
};

const getNextDisplayOrder = async (): Promise<number> => {
  const latestItem = await CurrentlyBuildingModel.findOne()
    .sort({ displayOrder: -1 })
    .select("displayOrder")
    .exec();

  return (latestItem?.displayOrder ?? 0) + 1;
};

const buildCurrentlyBuildingFilter = (
  query: AdminCurrentlyBuildingQueryInput,
): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};

  if (query.search) {
    const searchRegex = new RegExp(escapeRegExp(query.search), "i");
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { currentFocus: searchRegex },
      { techStack: searchRegex },
      { highlights: searchRegex },
    ];
  }

  if (typeof query.isVisible === "boolean") {
    filter.isVisible = query.isVisible;
  }

  return filter;
};

export const getAdminCurrentlyBuildingItems = async (
  query: AdminCurrentlyBuildingQueryInput,
): Promise<CurrentlyBuildingDocument[]> => {
  return CurrentlyBuildingModel.find(buildCurrentlyBuildingFilter(query))
    .sort({ displayOrder: 1, createdAt: -1 })
    .exec();
};

export const getAdminCurrentlyBuildingItemById = async (
  id: string,
): Promise<CurrentlyBuildingDocument> => {
  return requireCurrentlyBuildingItem(id);
};

export const getVisibleCurrentlyBuildingItems = async (): Promise<
  CurrentlyBuildingDocument[]
> => {
  return CurrentlyBuildingModel.find({ isVisible: true })
    .sort({ displayOrder: 1, createdAt: -1 })
    .exec();
};

export const createCurrentlyBuildingItem = async (
  input: CreateCurrentlyBuildingInput,
): Promise<CurrentlyBuildingDocument> => {
  return CurrentlyBuildingModel.create({
    ...input,
    isVisible: input.isVisible ?? true,
    displayOrder: await getNextDisplayOrder(),
  });
};

export const updateCurrentlyBuildingItem = async (
  id: string,
  input: UpdateCurrentlyBuildingInput,
): Promise<CurrentlyBuildingDocument> => {
  const item = await requireCurrentlyBuildingItem(id);

  item.set(input);
  await item.save();

  return item;
};

export const deleteCurrentlyBuildingItem = async (
  id: string,
): Promise<CurrentlyBuildingDocument> => {
  const item = await CurrentlyBuildingModel.findByIdAndDelete(id).exec();

  if (!item) {
    throw new AppError(
      "Currently-building item not found",
      404,
      "CURRENTLY_BUILDING_ITEM_NOT_FOUND",
    );
  }

  return item;
};

export const toggleCurrentlyBuildingItemVisibility = async (
  id: string,
  isVisible: boolean,
): Promise<CurrentlyBuildingDocument> => {
  const item = await requireCurrentlyBuildingItem(id);

  item.isVisible = isVisible;
  await item.save();

  return item;
};

export const reorderCurrentlyBuildingItems = async (
  orderedIds: string[],
): Promise<CurrentlyBuildingDocument[]> => {
  const existingItems = await CurrentlyBuildingModel.find({
    _id: { $in: orderedIds },
  })
    .select("_id")
    .exec();

  if (existingItems.length !== orderedIds.length) {
    throw new AppError(
      "All orderedIds must belong to existing currently-building items",
      404,
      "CURRENTLY_BUILDING_REORDER_IDS_NOT_FOUND",
    );
  }

  const totalItems = await CurrentlyBuildingModel.countDocuments();

  if (orderedIds.length !== totalItems) {
    throw new AppError(
      "orderedIds must include every currently-building item exactly once",
      422,
      "CURRENTLY_BUILDING_REORDER_INCOMPLETE",
    );
  }

  await runWithOptionalTransaction((session) =>
    CurrentlyBuildingModel.bulkWrite(
      orderedIds.map((itemId, index) => ({
        updateOne: {
          filter: { _id: itemId },
          update: { $set: { displayOrder: index + 1 } },
        },
      })),
      { session },
    ),
  );

  return CurrentlyBuildingModel.find()
    .sort({ displayOrder: 1, createdAt: -1 })
    .exec();
};
