import type { ImageAsset } from "@/types/image-asset";

export type AdminCertification = {
  id: string;
  title: string;
  provider: string;
  note: string;
  image: ImageAsset;
  verifyUrl?: string;
  credentialId?: string;
  date?: string;
  skills: string[];
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateCertificationInput = {
  title: string;
  provider: string;
  note: string;
  image: ImageAsset;
  verifyUrl?: string;
  credentialId?: string;
  date?: string;
  skills?: string[];
  isVisible?: boolean;
};

export type UpdateCertificationInput = {
  title?: string;
  provider?: string;
  note?: string;
  verifyUrl?: string;
  credentialId?: string;
  date?: string;
  skills?: string[];
};
