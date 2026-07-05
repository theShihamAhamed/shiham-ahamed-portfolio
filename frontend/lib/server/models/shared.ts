import { Schema } from "mongoose";

export type ImageAssetEntity = {
  url: string;
  fileId: string;
  alt: string;
  width?: number;
  height?: number;
  name?: string;
};

export const imageAssetSchema = new Schema<ImageAssetEntity>(
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

