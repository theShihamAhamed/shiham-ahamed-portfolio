import mongoose, { type ClientSession } from "mongoose";

import { AppError } from "../../utils/app-error";
import { escapeRegExp } from "../../utils/query";
import { deleteImage, uploadImage } from "../uploads/uploads.service";
import {
  CertificationModel,
  type CertificationDocument,
} from "./certification.model";
import type {
  AdminCertificationQueryInput,
  CreateCertificationInput,
  UpdateCertificationInput,
} from "./certification.validation";

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

const requireCertification = async (
  id: string,
): Promise<CertificationDocument> => {
  const certification = await CertificationModel.findById(id).exec();

  if (!certification) {
    throw new AppError(
      "Certification not found",
      404,
      "CERTIFICATION_NOT_FOUND",
    );
  }

  return certification;
};

const getNextDisplayOrder = async (): Promise<number> => {
  const latestCertification = await CertificationModel.findOne()
    .sort({ displayOrder: -1 })
    .select("displayOrder")
    .exec();

  return (latestCertification?.displayOrder ?? 0) + 1;
};

const cleanupImageKitFile = async (
  fileId: string | undefined,
  context: string,
): Promise<void> => {
  if (!fileId) return;

  try {
    await deleteImage(fileId);
  } catch (error) {
    console.error(`ImageKit cleanup failed for ${context} (${fileId})`, error);
  }
};

const buildCertificationFilter = (
  query: AdminCertificationQueryInput,
): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};

  if (query.search) {
    const searchRegex = new RegExp(escapeRegExp(query.search), "i");
    filter.$or = [
      { title: searchRegex },
      { provider: searchRegex },
      { note: searchRegex },
      { credentialId: searchRegex },
      { skills: searchRegex },
    ];
  }

  if (typeof query.isVisible === "boolean") {
    filter.isVisible = query.isVisible;
  }

  return filter;
};

export const getAdminCertifications = async (
  query: AdminCertificationQueryInput,
): Promise<CertificationDocument[]> => {
  return CertificationModel.find(buildCertificationFilter(query))
    .sort({ displayOrder: 1, createdAt: -1 })
    .exec();
};

export const getAdminCertificationById = async (
  id: string,
): Promise<CertificationDocument> => {
  return requireCertification(id);
};

export const getVisibleCertifications = async (): Promise<
  CertificationDocument[]
> => {
  return CertificationModel.find({ isVisible: true })
    .sort({ displayOrder: 1, createdAt: -1 })
    .exec();
};

export const createCertification = async (
  input: CreateCertificationInput,
): Promise<CertificationDocument> => {
  return CertificationModel.create({
    ...input,
    isVisible: input.isVisible ?? true,
    displayOrder: await getNextDisplayOrder(),
  });
};

export const updateCertification = async (
  id: string,
  input: UpdateCertificationInput,
): Promise<CertificationDocument> => {
  const certification = await requireCertification(id);

  certification.set(input);
  await certification.save();

  return certification;
};

export const deleteCertification = async (
  id: string,
): Promise<CertificationDocument> => {
  const certification = await CertificationModel.findByIdAndDelete(id).exec();

  if (!certification) {
    throw new AppError(
      "Certification not found",
      404,
      "CERTIFICATION_NOT_FOUND",
    );
  }

  await cleanupImageKitFile(certification.image.fileId, `certification delete ${id}`);

  return certification;
};

export const replaceCertificationImage = async (
  id: string,
  file: Express.Multer.File,
  alt: string,
): Promise<CertificationDocument> => {
  const nextImage = await uploadImage({
    file,
    folder: "certifications",
    alt,
  });

  try {
    const certification = await requireCertification(id);
    const oldFileId = certification.image.fileId;

    certification.image = nextImage;
    await certification.save();

    await cleanupImageKitFile(oldFileId, `certification image replacement ${id}`);

    return certification;
  } catch (error) {
    await cleanupImageKitFile(
      nextImage.fileId,
      `failed certification image replacement ${id}`,
    );
    throw error;
  }
};

export const toggleCertificationVisibility = async (
  id: string,
  isVisible: boolean,
): Promise<CertificationDocument> => {
  const certification = await requireCertification(id);

  certification.isVisible = isVisible;
  await certification.save();

  return certification;
};

export const reorderCertifications = async (
  orderedIds: string[],
): Promise<CertificationDocument[]> => {
  const existingCertifications = await CertificationModel.find({
    _id: { $in: orderedIds },
  })
    .select("_id")
    .exec();

  if (existingCertifications.length !== orderedIds.length) {
    throw new AppError(
      "All orderedIds must belong to existing certifications",
      404,
      "CERTIFICATION_REORDER_IDS_NOT_FOUND",
    );
  }

  const totalCertifications = await CertificationModel.countDocuments();

  if (orderedIds.length !== totalCertifications) {
    throw new AppError(
      "orderedIds must include every certification exactly once",
      422,
      "CERTIFICATION_REORDER_INCOMPLETE",
    );
  }

  await runWithOptionalTransaction((session) =>
    CertificationModel.bulkWrite(
      orderedIds.map((certificationId, index) => ({
        updateOne: {
          filter: { _id: certificationId },
          update: { $set: { displayOrder: index + 1 } },
        },
      })),
      { session },
    ),
  );

  return CertificationModel.find()
    .sort({ displayOrder: 1, createdAt: -1 })
    .exec();
};
