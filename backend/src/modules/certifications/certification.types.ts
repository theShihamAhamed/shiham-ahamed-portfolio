import type { ImageAsset } from "../../types/image-asset";

export type CertificationEntity = {
  title: string;
  provider: string;
  note: string;
  image: ImageAsset;
  verifyUrl?: string;
  credentialId?: string;
  date?: string;
  skills?: string[];
  isVisible: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
};
