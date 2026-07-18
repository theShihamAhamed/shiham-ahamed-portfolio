import { mongoose, type ClientSession } from "@portfolio/db";

import type { ImageAsset } from "../../types/image-asset";
import { AppError } from "../../utils/app-error";
import { deleteImage, uploadImage, uploadImages } from "../uploads/uploads.service";
import { ProjectModel, type ProjectDocument } from "./project.model";
import type {
  AdminProjectQueryInput,
  CreateProjectInput,
  UpdateProjectInput,
} from "./project.validation";
import { escapeRegExp } from "../../utils/query";
import { generateSlug, isValidSlug } from "../../utils/slug";
import { assertValidProjectTimeline } from "./project.timeline";

const maxVisibleFeaturedProjects = 6;

const isDuplicateKeyError = (error: unknown): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
};

const normalizeDuplicateSlugError = (error: unknown): never => {
  if (isDuplicateKeyError(error)) {
    throw new AppError("Project slug already exists", 409, "DUPLICATE_SLUG");
  }

  throw error;
};

const requireProject = async (id: string): Promise<ProjectDocument> => {
  const project = await ProjectModel.findById(id).exec();

  if (!project) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  return project;
};

const getNextDisplayOrder = async (): Promise<number> => {
  const latestProject = await ProjectModel.findOne()
    .sort({ displayOrder: -1 })
    .select("displayOrder")
    .exec();

  return (latestProject?.displayOrder ?? 0) + 1;
};

const assertUniqueSlug = async (
  slug: string,
  excludeProjectId?: string,
): Promise<void> => {
  const existingProject = await ProjectModel.exists({
    slug,
    ...(excludeProjectId ? { _id: { $ne: excludeProjectId } } : {}),
  });

  if (existingProject) {
    throw new AppError("Project slug already exists", 409, "DUPLICATE_SLUG");
  }
};

const assertVisibleFeaturedLimit = async (
  excludeProjectId?: string,
): Promise<void> => {
  const visibleFeaturedCount = await ProjectModel.countDocuments({
    isVisible: true,
    isFeatured: true,
    ...(excludeProjectId ? { _id: { $ne: excludeProjectId } } : {}),
  });

  if (visibleFeaturedCount >= maxVisibleFeaturedProjects) {
    throw new AppError(
      "Visible featured projects cannot exceed 6",
      409,
      "FEATURED_PROJECT_LIMIT_REACHED",
    );
  }
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

const cleanupImageKitFiles = async (
  fileIds: string[],
  context: string,
): Promise<void> => {
  await Promise.all(
    fileIds.map((fileId) => cleanupImageKitFile(fileId, context)),
  );
};

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

const visibleFeaturedWouldExceedLimit = (
  isVisible: boolean,
  isFeatured: boolean,
) => isVisible && isFeatured;

const buildProjectFilter = (
  query: AdminProjectQueryInput,
): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};

  if (query.search) {
    const searchRegex = new RegExp(escapeRegExp(query.search), "i");
    filter.$or = [
      { title: searchRegex },
      { slug: searchRegex },
      { shortDescription: searchRegex },
      { "techStack.label": searchRegex },
    ];
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.projectType) {
    filter.projectType = query.projectType;
  }

  if (typeof query.isFeatured === "boolean") {
    filter.isFeatured = query.isFeatured;
  }

  if (typeof query.isVisible === "boolean") {
    filter.isVisible = query.isVisible;
  }

  return filter;
};

export const getAdminProjects = async (
  query: AdminProjectQueryInput,
): Promise<ProjectDocument[]> => {
  return ProjectModel.find(buildProjectFilter(query))
    .sort({ displayOrder: 1, createdAt: -1 })
    .exec();
};

export const getAdminProjectById = async (
  id: string,
): Promise<ProjectDocument> => {
  return requireProject(id);
};

export const getVisibleProjects = async (): Promise<ProjectDocument[]> => {
  return ProjectModel.find({ isVisible: true })
    .sort({ displayOrder: 1, createdAt: -1 })
    .exec();
};

export const getFeaturedProjects = async (): Promise<ProjectDocument[]> => {
  return ProjectModel.find({ isVisible: true, isFeatured: true })
    .sort({ displayOrder: 1, createdAt: -1 })
    .limit(maxVisibleFeaturedProjects)
    .exec();
};

export const getVisibleProjectBySlug = async (
  slug: string,
): Promise<ProjectDocument> => {
  const project = await ProjectModel.findOne({ slug, isVisible: true }).exec();

  if (!project) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  return project;
};

export const createProject = async (
  input: CreateProjectInput,
): Promise<ProjectDocument> => {
  assertValidProjectTimeline(input);

  const slug = input.slug ?? generateSlug(input.title);

  if (!slug || !isValidSlug(slug)) {
    throw new AppError(
      "Project slug must be lowercase kebab-case",
      422,
      "INVALID_PROJECT_SLUG",
    );
  }

  await assertUniqueSlug(slug);

  const isVisible = input.isVisible ?? true;
  const isFeatured = input.isFeatured ?? false;

  if (visibleFeaturedWouldExceedLimit(isVisible, isFeatured)) {
    await assertVisibleFeaturedLimit();
  }

  try {
    return await ProjectModel.create({
      ...input,
      slug,
      isVisible,
      isFeatured,
      displayOrder: await getNextDisplayOrder(),
    });
  } catch (error) {
    return normalizeDuplicateSlugError(error);
  }
};

export const updateProject = async (
  id: string,
  input: UpdateProjectInput,
): Promise<ProjectDocument> => {
  const project = await requireProject(id);
  const includesEndDate = Object.prototype.hasOwnProperty.call(input, "endDate");

  assertValidProjectTimeline({
    status: input.status ?? project.status,
    startDate: input.startDate ?? project.startDate,
    endDate: includesEndDate ? input.endDate : project.endDate,
  });

  if (input.slug && input.slug !== project.slug) {
    await assertUniqueSlug(input.slug, id);
  }

  const includesCaseStudyMdx = Object.prototype.hasOwnProperty.call(input, "caseStudyMdx");
  const { architecture, endDate, caseStudyMdx, ...projectUpdates } = input;

  project.set(projectUpdates);

  if (includesEndDate) {
    project.set("endDate", endDate);
  }

  if (includesCaseStudyMdx) {
    project.set("caseStudyMdx", caseStudyMdx);
  }

  if (architecture) {
    if (Object.prototype.hasOwnProperty.call(architecture, "summary")) {
      project.set("architecture.summary", architecture.summary);
    }

    if (Object.prototype.hasOwnProperty.call(architecture, "points")) {
      project.set("architecture.points", architecture.points);
    }
  }

  try {
    await project.save();
    return project;
  } catch (error) {
    return normalizeDuplicateSlugError(error);
  }
};

export const deleteProject = async (id: string): Promise<ProjectDocument> => {
  const project = await ProjectModel.findByIdAndDelete(id).exec();

  if (!project) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  const fileIds = [
    project.thumbnail.fileId,
    ...(project.architecture?.image?.fileId
      ? [project.architecture.image.fileId]
      : []),
    ...project.gallery.map((image) => image.fileId),
  ];

  await cleanupImageKitFiles(fileIds, `project delete ${id}`);

  return project;
};

export const toggleProjectFeatured = async (
  id: string,
  isFeatured: boolean,
): Promise<ProjectDocument> => {
  const project = await requireProject(id);

  if (isFeatured && project.isVisible) {
    await assertVisibleFeaturedLimit(id);
  }

  project.isFeatured = isFeatured;
  await project.save();

  return project;
};

export const toggleProjectVisibility = async (
  id: string,
  isVisible: boolean,
): Promise<ProjectDocument> => {
  const project = await requireProject(id);

  if (isVisible && project.isFeatured) {
    await assertVisibleFeaturedLimit(id);
  }

  project.isVisible = isVisible;
  await project.save();

  return project;
};

export const reorderProjects = async (
  orderedIds: string[],
): Promise<ProjectDocument[]> => {
  const existingProjects = await ProjectModel.find({ _id: { $in: orderedIds } })
    .select("_id")
    .exec();

  if (existingProjects.length !== orderedIds.length) {
    throw new AppError(
      "All orderedIds must belong to existing projects",
      404,
      "PROJECT_REORDER_IDS_NOT_FOUND",
    );
  }

  const totalProjects = await ProjectModel.countDocuments();

  if (orderedIds.length !== totalProjects) {
    throw new AppError(
      "orderedIds must include every project exactly once",
      422,
      "PROJECT_REORDER_INCOMPLETE",
    );
  }

  await runWithOptionalTransaction((session) =>
    ProjectModel.bulkWrite(
      orderedIds.map((projectId, index) => ({
        updateOne: {
          filter: { _id: projectId },
          update: { $set: { displayOrder: index + 1 } },
        },
      })),
      { session },
    ),
  );

  return ProjectModel.find().sort({ displayOrder: 1, createdAt: -1 }).exec();
};

export const replaceProjectThumbnail = async (
  id: string,
  file: Express.Multer.File,
  alt: string,
): Promise<ProjectDocument> => {
  const nextImage = await uploadImage({
    file,
    folder: "projects-thumbnails",
    alt,
  });

  try {
    const project = await requireProject(id);
    const oldFileId = project.thumbnail.fileId;

    project.thumbnail = nextImage;
    await project.save();

    await cleanupImageKitFile(oldFileId, `thumbnail replacement ${id}`);

    return project;
  } catch (error) {
    await cleanupImageKitFile(nextImage.fileId, `failed thumbnail replacement ${id}`);
    throw error;
  }
};

export const replaceProjectArchitectureImage = async (
  id: string,
  file: Express.Multer.File,
  alt: string,
): Promise<ProjectDocument> => {
  const nextImage = await uploadImage({
    file,
    folder: "projects-architecture",
    alt,
  });

  try {
    const project = await requireProject(id);
    const oldFileId = project.architecture?.image?.fileId;

    project.set("architecture.image", nextImage);
    await project.save();

    await cleanupImageKitFile(oldFileId, `architecture image replacement ${id}`);

    return project;
  } catch (error) {
    await cleanupImageKitFile(
      nextImage.fileId,
      `failed architecture image replacement ${id}`,
    );
    throw error;
  }
};

export const deleteProjectArchitectureImage = async (
  id: string,
): Promise<ProjectDocument> => {
  const project = await requireProject(id);
  const oldImage = project.architecture?.image;

  if (!oldImage) {
    throw new AppError(
      "Architecture image not found",
      404,
      "ARCHITECTURE_IMAGE_NOT_FOUND",
    );
  }

  project.set("architecture.image", undefined);
  await project.save();

  await cleanupImageKitFile(oldImage.fileId, `architecture image delete ${id}`);

  return project;
};

export const addProjectGalleryImages = async (
  id: string,
  files: Express.Multer.File[],
  alt: string,
): Promise<ProjectDocument> => {
  const images = await uploadImages({
    files,
    folder: "projects-gallery",
    alt,
  });

  try {
    const project = await requireProject(id);

    project.gallery.push(...images);
    await project.save();

    return project;
  } catch (error) {
    await cleanupImageKitFiles(
      images.map((image) => image.fileId),
      `failed gallery add ${id}`,
    );
    throw error;
  }
};

export const deleteProjectGalleryImage = async (
  id: string,
  imageFileId: string,
): Promise<ProjectDocument> => {
  const project = await requireProject(id);

  if (project.gallery.length <= 1) {
    throw new AppError(
      "Cannot delete the final gallery image",
      409,
      "FINAL_GALLERY_IMAGE_REQUIRED",
    );
  }

  const imageIndex = project.gallery.findIndex(
    (image) => image.fileId === imageFileId,
  );

  if (imageIndex === -1) {
    throw new AppError("Gallery image not found", 404, "GALLERY_IMAGE_NOT_FOUND");
  }

  const [removedImage] = project.gallery.splice(imageIndex, 1) as ImageAsset[];
  await project.save();

  await cleanupImageKitFile(removedImage.fileId, `gallery image delete ${id}`);

  return project;
};

export const reorderProjectGalleryImages = async (
  id: string,
  orderedFileIds: string[],
): Promise<ProjectDocument> => {
  const project = await requireProject(id);
  const currentFileIds = project.gallery.map((image) => image.fileId);
  const currentFileIdSet = new Set(currentFileIds);
  const requestedFileIdSet = new Set(orderedFileIds);

  if (
    orderedFileIds.length !== currentFileIds.length ||
    currentFileIds.some((fileId) => !requestedFileIdSet.has(fileId)) ||
    orderedFileIds.some((fileId) => !currentFileIdSet.has(fileId))
  ) {
    throw new AppError(
      "orderedFileIds must contain every current gallery fileId exactly once",
      422,
      "GALLERY_REORDER_MISMATCH",
    );
  }

  const reorderedGallery = orderedFileIds.map((fileId) => {
    const image = project.gallery.find((galleryImage) => galleryImage.fileId === fileId);

    if (!image) {
      throw new AppError(
        "Gallery reorder contains an unknown image",
        422,
        "GALLERY_REORDER_UNKNOWN_IMAGE",
      );
    }

    return image;
  });

  project.gallery = reorderedGallery;
  await project.save();

  return project;
};
