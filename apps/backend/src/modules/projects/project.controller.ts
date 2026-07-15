import { AppError } from "../../utils/app-error";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import {
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

const revalidateProjectCache = (
  request: {
    entity: "project";
    action: "create" | "update" | "delete";
    slug: string;
    previousSlug?: string;
  },
  context: string,
) => {
  void revalidatePublicCache(request, context);
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
  revalidateProjectCache(
    { entity: "project", action: "create", slug: project.slug },
    "project create",
  );

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
  const previousProject = await getAdminProjectById(String(req.params.id));
  const project = await updateProject(
    String(req.params.id),
    req.body as UpdateProjectInput,
  );
  revalidateProjectCache(
    {
      entity: "project",
      action: "update",
      slug: project.slug,
      ...(previousProject.slug !== project.slug
        ? { previousSlug: previousProject.slug }
        : {}),
    },
    "project update",
  );

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
  const project = await getAdminProjectById(String(req.params.id));
  await deleteProject(String(req.params.id));
  revalidateProjectCache(
    { entity: "project", action: "delete", slug: project.slug },
    "project delete",
  );

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
  revalidateProjectCache(
    { entity: "project", action: "update", slug: project.slug },
    "project featured update",
  );

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
  revalidateProjectCache(
    { entity: "project", action: "update", slug: project.slug },
    "project visibility update",
  );

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
  projects.forEach((project) =>
    revalidateProjectCache(
      { entity: "project", action: "update", slug: project.slug },
      "project reorder",
    ),
  );

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
  revalidateProjectCache(
    { entity: "project", action: "update", slug: project.slug },
    "project thumbnail replacement",
  );

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
  revalidateProjectCache(
    { entity: "project", action: "update", slug: project.slug },
    "project architecture image replacement",
  );

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
  revalidateProjectCache(
    { entity: "project", action: "update", slug: project.slug },
    "project architecture image delete",
  );

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
  revalidateProjectCache(
    { entity: "project", action: "update", slug: project.slug },
    "project gallery image add",
  );

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
  revalidateProjectCache(
    { entity: "project", action: "update", slug: project.slug },
    "project gallery image delete",
  );

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
  revalidateProjectCache(
    { entity: "project", action: "update", slug: project.slug },
    "project gallery reorder",
  );

  return sendSuccess(
    res,
    {
      project: serializeAdminProject(project),
    },
    200,
    { message: "Project gallery reordered successfully" },
  );
});
