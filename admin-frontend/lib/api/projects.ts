import { requestApi } from "@/lib/api/client";
import type {
  AdminProject,
  CreateProjectInput,
  ProjectStatus,
  UpdateProjectInput,
} from "@/types/project";

type ProjectsResponse = {
  projects: AdminProject[];
};

type ProjectResponse = {
  project: AdminProject;
};

export type ProjectFilters = {
  search?: string;
  status?: ProjectStatus;
  projectType?: string;
  isFeatured?: boolean;
  isVisible?: boolean;
};

const toProjectsPath = (filters: ProjectFilters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }

    params.set(key, String(value));
  });

  const query = params.toString();

  return query ? `/api/projects?${query}` : "/api/projects";
};

export const getProjects = async (
  filters: ProjectFilters = {},
): Promise<AdminProject[]> => {
  const response = await requestApi<ProjectsResponse>(toProjectsPath(filters));

  return response.data.projects;
};

export const getProjectById = async (id: string): Promise<AdminProject> => {
  const response = await requestApi<ProjectResponse>(
    `/api/projects/${encodeURIComponent(id)}`,
  );

  return response.data.project;
};

export const createProject = async (
  input: CreateProjectInput,
): Promise<AdminProject> => {
  const response = await requestApi<ProjectResponse>("/api/projects", {
    method: "POST",
    body: input,
  });

  return response.data.project;
};

export const updateProject = async (
  id: string,
  input: UpdateProjectInput,
): Promise<AdminProject> => {
  const response = await requestApi<ProjectResponse>(
    `/api/projects/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: input,
    },
  );

  return response.data.project;
};

export const replaceProjectThumbnail = async ({
  id,
  file,
  alt,
}: {
  id: string;
  file: File;
  alt: string;
}): Promise<AdminProject> => {
  const body = new FormData();
  body.append("file", file);
  body.append("alt", alt);

  const response = await requestApi<ProjectResponse>(
    `/api/projects/${encodeURIComponent(id)}/thumbnail`,
    {
      method: "PATCH",
      body,
    },
  );

  return response.data.project;
};

export const replaceProjectArchitectureImage = async ({
  id,
  file,
  alt,
}: {
  id: string;
  file: File;
  alt: string;
}): Promise<AdminProject> => {
  const body = new FormData();
  body.append("file", file);
  body.append("alt", alt);

  const response = await requestApi<ProjectResponse>(
    `/api/projects/${encodeURIComponent(id)}/architecture-image`,
    {
      method: "PATCH",
      body,
    },
  );

  return response.data.project;
};

export const deleteProjectArchitectureImage = async (
  id: string,
): Promise<AdminProject> => {
  const response = await requestApi<ProjectResponse>(
    `/api/projects/${encodeURIComponent(id)}/architecture-image`,
    {
      method: "DELETE",
    },
  );

  return response.data.project;
};

export const addProjectGalleryImages = async ({
  id,
  files,
  alt,
}: {
  id: string;
  files: File[];
  alt: string | string[];
}): Promise<AdminProject> => {
  const body = new FormData();
  files.forEach((file) => {
    body.append("files", file);
  });
  body.append("alt", Array.isArray(alt) ? JSON.stringify(alt) : alt);

  const response = await requestApi<ProjectResponse>(
    `/api/projects/${encodeURIComponent(id)}/gallery`,
    {
      method: "POST",
      body,
    },
  );

  return response.data.project;
};

export const deleteProjectGalleryImage = async ({
  id,
  imageFileId,
}: {
  id: string;
  imageFileId: string;
}): Promise<AdminProject> => {
  const response = await requestApi<ProjectResponse>(
    `/api/projects/${encodeURIComponent(id)}/gallery/${encodeURIComponent(
      imageFileId,
    )}`,
    {
      method: "DELETE",
    },
  );

  return response.data.project;
};

export const reorderProjects = async (
  orderedIds: string[],
): Promise<AdminProject[]> => {
  const response = await requestApi<ProjectsResponse>("/api/projects/reorder", {
    method: "PATCH",
    body: { orderedIds },
  });

  return response.data.projects;
};

export const reorderProjectGallery = async ({
  id,
  orderedFileIds,
}: {
  id: string;
  orderedFileIds: string[];
}): Promise<AdminProject> => {
  const response = await requestApi<ProjectResponse>(
    `/api/projects/${encodeURIComponent(id)}/gallery/reorder`,
    {
      method: "PATCH",
      body: { orderedFileIds },
    },
  );

  return response.data.project;
};

export const toggleProjectFeatured = async (
  id: string,
  isFeatured: boolean,
): Promise<AdminProject> => {
  const response = await requestApi<ProjectResponse>(`/api/projects/${id}/featured`, {
    method: "PATCH",
    body: { isFeatured },
  });

  return response.data.project;
};

export const toggleProjectVisibility = async (
  id: string,
  isVisible: boolean,
): Promise<AdminProject> => {
  const response = await requestApi<ProjectResponse>(
    `/api/projects/${id}/visibility`,
    {
      method: "PATCH",
      body: { isVisible },
    },
  );

  return response.data.project;
};

export const deleteProject = async (id: string): Promise<void> => {
  await requestApi<{ deleted: boolean; id: string }>(`/api/projects/${id}`, {
    method: "DELETE",
  });
};
