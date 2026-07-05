import {
  model,
  models,
  Schema,
  type HydratedDocument,
  type Model,
} from "mongoose";

import type { CertificationEntity } from "./certification.types";

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

const certificationSchema = new Schema<CertificationEntity>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: imageAssetSchema,
      required: true,
    },
    verifyUrl: {
      type: String,
      trim: true,
    },
    credentialId: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      trim: true,
    },
    skills: {
      type: [{ type: String, trim: true }],
      default: undefined,
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

certificationSchema.index({ displayOrder: 1 });
certificationSchema.index({ isVisible: 1, displayOrder: 1 });
certificationSchema.index({ title: 1 });
certificationSchema.index({ provider: 1 });

export type CertificationDocument = HydratedDocument<CertificationEntity>;

export const CertificationModel =
  (models.Certification as Model<CertificationEntity> | undefined) ||
  model<CertificationEntity>("Certification", certificationSchema);
