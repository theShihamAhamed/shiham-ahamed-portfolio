import type { CurrentlyBuildingDocument } from "./currently-building.model";

export const serializeAdminCurrentlyBuilding = (
  item: CurrentlyBuildingDocument,
) => {
  const doc = item.toObject();

  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    status: doc.status,
    currentFocus: doc.currentFocus,
    techStack: doc.techStack,
    highlights: doc.highlights,
    ...(doc.link ? { link: doc.link } : {}),
    isVisible: doc.isVisible,
    displayOrder: doc.displayOrder,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

export const serializePublicCurrentlyBuilding = (
  item: CurrentlyBuildingDocument,
) => {
  const doc = item.toObject();

  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    status: doc.status,
    currentFocus: doc.currentFocus,
    techStack: doc.techStack,
    highlights: doc.highlights,
    ...(doc.link ? { link: doc.link } : {}),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};
