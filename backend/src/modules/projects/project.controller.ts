import { AppError } from "../../utils/app-error";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import {
  PUBLIC_CACHE_TAGS,
  revalidatePublicCache,
} from "../../lib/revalidate-public-cache";
import {
  addProjectGalleryImages,
  createProject,
  deleteProject,
  deleteProjectArchitectureImage,
  deleteProjectGalleryImage,
  getAdminProjectById,
  getAdminProjects,
  getFeaturedProjects,
  getVisibleProjectBySlug,
  getVisibleProjects,
  reorderProjectGalleryImages,
  reorderProjects,
  replaceProjectArchitectureImage,
  replaceProjectThumbnail,
  toggleProjectFeatured,
  toggleProjectVisibility,
  updateProject,
} from "./project.service";
import {
  serializeAdminProject,
  serializePublicProject,
} from "./project.serializer";
import type {
  AdminProjectQueryInput,
  CreateProjectInput,
  UpdateProjectInput,
} from "./project.validation";

const getRequestFile = (file: Express.Multer.File | undefined) => {
  if (!file) {
    throw new AppError("Image file is required", 400, "FILE_REQUIRED");
  }

  return file;
};

const getRequestFiles = (files: Express.Multer.File[] | undefined) => {
  if (!files || files.length === 0) {
    throw new AppError("At least one image file is required", 400, "FILES_REQUIRED");
  }

  return files;
};

const revalidateProjectCache = (context: string) => {
  void revalidatePublicCache(
    [
      PUBLIC_CACHE_TAGS.projects,
      PUBLIC_CACHE_TAGS.featuredProjects,
      PUBLIC_CACHE_TAGS.projectDetail,
    ],
    context,
  );
};

export const listAdminProjects = asyncHandler(async (req, res) => {
  const projects = await getAdminProjects(
    (res.locals.validated?.query ?? req.query) as AdminProjectQueryInput,
  );

  return sendSuccess(
    res,
    {
      projects: projects.map(serializeAdminProject),
    },
    200,
    { meta: { count: projects.length } },
  );
});

export const getAdminProject = asyncHandler(async (req, res) => {
  const project = await getAdminProjectById(String(req.params.id));

  return sendSuccess(res, {
    project: serializeAdminProject(project),
  });
});

export const listVisibleProjects = asyncHandler(async (_req, res) => {
  const projects = await getVisibleProjects();

  return sendSuccess(
    res,
    {
      projects: projects.map(serializePublicProject),
    },
    200,
    { meta: { count: projects.length } },
  );
});

export const listFeaturedProjects = asyncHandler(async (_req, res) => {
  const projects = await getFeaturedProjects();

  return sendSuccess(
    res,
    {
      projects: projects.map(serializePublicProject),
    },
    200,
    { meta: { count: projects.length } },
  );
});

export const getProjectBySlug = asyncHandler(async (req, res) => {
  const project = await getVisibleProjectBySlug(String(req.params.slug));

  return sendSuccess(res, {
    project: serializePublicProject(project),
  });
});

export const createAdminProject = asyncHandler(async (req, res) => {
  const project = await createProject(req.body as CreateProjectInput);
  revalidateProjectCache("project create");

  return sendSuccess(
    res,
    {
      project: serializeAdminProject(project),
    },
    201,
    { message: "Project created successfully" },
  );
});

export const updateAdminProject = asyncHandler(async (req, res) => {
  const project = await updateProject(
    String(req.params.id),
    req.body as UpdateProjectInput,
  );
  revalidateProjectCache("project update");

  return sendSuccess(
    res,
    {
      project: serializeAdminProject(project),
    },
    200,
    { message: "Project updated successfully" },
  );
});

export const deleteAdminProject = asyncHandler(async (req, res) => {
  await deleteProject(String(req.params.id));
  revalidateProjectCache("project delete");

  return sendSuccess(
    res,
    {
      deleted: true,
      id: String(req.params.id),
    },
    200,
    { message: "Project deleted successfully" },
  );
});

export const updateProjectFeatured = asyncHandler(async (req, res) => {
  const project = await toggleProjectFeatured(
    String(req.params.id),
    Boolean(req.body.isFeatured),
  );
  revalidateProjectCache("project featured update");

  return sendSuccess(
    res,
    {
      project: serializeAdminProject(project),
    },
    200,
    { message: "Project featured status updated successfully" },
  );
});

export const updateProjectVisibility = asyncHandler(async (req, res) => {
  const project = await toggleProjectVisibility(
    String(req.params.id),
    Boolean(req.body.isVisible),
  );
  revalidateProjectCache("project visibility update");

  return sendSuccess(
    res,
    {
      project: serializeAdminProject(project),
    },
    200,
    { message: "Project visibility updated successfully" },
  );
});

export const reorderAdminProjects = asyncHandler(async (req, res) => {
  const projects = await reorderProjects(req.body.orderedIds);
  revalidateProjectCache("project reorder");

  return sendSuccess(
    res,
    {
      projects: projects.map(serializeAdminProject),
    },
    200,
    { message: "Projects reordered successfully", meta: { count: projects.length } },
  );
});

export const replaceThumbnail = asyncHandler(async (req, res) => {
  const project = await replaceProjectThumbnail(
    String(req.params.id),
    getRequestFile(req.file),
    String(req.body.alt),
  );
  revalidateProjectCache("project thumbnail replacement");

  return sendSuccess(
    res,
    {
      project: serializeAdminProject(project),
    },
    200,
    { message: "Project thumbnail replaced successfully" },
  );
});

export const replaceArchitectureImage = asyncHandler(async (req, res) => {
  const project = await replaceProjectArchitectureImage(
    String(req.params.id),
    getRequestFile(req.file),
    String(req.body.alt),
  );
  revalidateProjectCache("project architecture image replacement");

  return sendSuccess(
    res,
    {
      project: serializeAdminProject(project),
    },
    200,
    { message: "Project architecture image replaced successfully" },
  );
});

export const deleteArchitectureImage = asyncHandler(async (req, res) => {
  const project = await deleteProjectArchitectureImage(String(req.params.id));
  revalidateProjectCache("project architecture image delete");

  return sendSuccess(
    res,
    {
      project: serializeAdminProject(project),
    },
    200,
    { message: "Project architecture image deleted successfully" },
  );
});

export const addGalleryImages = asyncHandler(async (req, res) => {
  const project = await addProjectGalleryImages(
    String(req.params.id),
    getRequestFiles(req.files as Express.Multer.File[] | undefined),
    String(req.body.alt),
  );
  revalidateProjectCache("project gallery image add");

  return sendSuccess(
    res,
    {
      project: serializeAdminProject(project),
    },
    200,
    { message: "Project gallery images added successfully" },
  );
});

export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const project = await deleteProjectGalleryImage(
    String(req.params.id),
    String(req.params.imageFileId),
  );
  revalidateProjectCache("project gallery image delete");

  return sendSuccess(
    res,
    {
      project: serializeAdminProject(project),
    },
    200,
    { message: "Project gallery image deleted successfully" },
  );
});

export const reorderGalleryImages = asyncHandler(async (req, res) => {
  const project = await reorderProjectGalleryImages(
    String(req.params.id),
    req.body.orderedFileIds,
  );
  revalidateProjectCache("project gallery reorder");

  return sendSuccess(
    res,
    {
      project: serializeAdminProject(project),
    },
    200,
    { message: "Project gallery reordered successfully" },
  );
});
