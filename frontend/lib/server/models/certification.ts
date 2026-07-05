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

export type CertificationEntity = {
  title: string;
  provider: string;
  note: string;
  image: ImageAssetEntity;
  verifyUrl?: string;
  credentialId?: string;
  date?: string;
  skills?: string[];
  isVisible: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

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

