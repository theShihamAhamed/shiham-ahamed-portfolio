import { model, models, Schema, type Document } from "mongoose";

export interface AdminSessionDocument extends Document {
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  userAgent?: string;
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminSessionSchema = new Schema<AdminSessionDocument>(
  {
    refreshTokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    ip: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
adminSessionSchema.index({ revokedAt: 1 });

export const AdminSession =
  models.AdminSession ||
  model<AdminSessionDocument>("AdminSession", adminSessionSchema);
