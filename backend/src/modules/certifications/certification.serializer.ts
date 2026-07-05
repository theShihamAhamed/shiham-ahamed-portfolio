import type { ImageAsset } from "../../types/image-asset";
import type { CertificationDocument } from "./certification.model";

type SerializedImageAsset = Omit<ImageAsset, "fileId"> & {
  fileId?: string;
};

const serializeImageAsset = (
  image: ImageAsset,
  includeFileId: boolean,
): SerializedImageAsset => ({
  url: image.url,
  ...(includeFileId ? { fileId: image.fileId } : {}),
  alt: image.alt,
  ...(image.width ? { width: image.width } : {}),
  ...(image.height ? { height: image.height } : {}),
  ...(image.name ? { name: image.name } : {}),
});

export const serializeAdminCertification = (
  certification: CertificationDocument,
) => {
  const doc = certification.toObject();

  return {
    id: doc._id.toString(),
    title: doc.title,
    provider: doc.provider,
    note: doc.note,
    image: serializeImageAsset(doc.image, true),
    ...(doc.verifyUrl ? { verifyUrl: doc.verifyUrl } : {}),
    ...(doc.credentialId ? { credentialId: doc.credentialId } : {}),
    ...(doc.date ? { date: doc.date } : {}),
    skills: doc.skills ?? [],
    isVisible: doc.isVisible,
    displayOrder: doc.displayOrder,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

export const serializePublicCertification = (
  certification: CertificationDocument,
) => {
  const doc = certification.toObject();

  return {
    id: doc._id.toString(),
    title: doc.title,
    provider: doc.provider,
    note: doc.note,
    image: serializeImageAsset(doc.image, false),
    ...(doc.verifyUrl ? { verifyUrl: doc.verifyUrl } : {}),
    ...(doc.credentialId ? { credentialId: doc.credentialId } : {}),
    ...(doc.date ? { date: doc.date } : {}),
    skills: doc.skills ?? [],
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};
