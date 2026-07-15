import { requestApi } from "@/lib/api/client";
import type {
  AdminCertification,
  CreateCertificationInput,
  UpdateCertificationInput,
} from "@/types/certification";

type CertificationsResponse = {
  certifications: AdminCertification[];
};

type CertificationResponse = {
  certification: AdminCertification;
};

export type CertificationFilters = {
  search?: string;
  isVisible?: boolean;
};

const toCertificationsPath = (filters: CertificationFilters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }

    params.set(key, String(value));
  });

  const query = params.toString();

  return query ? `/api/certifications?${query}` : "/api/certifications";
};

export const getCertifications = async (
  filters: CertificationFilters = {},
): Promise<AdminCertification[]> => {
  const response = await requestApi<CertificationsResponse>(
    toCertificationsPath(filters),
  );

  return response.data.certifications;
};

export const getCertificationById = async (
  id: string,
): Promise<AdminCertification> => {
  const response = await requestApi<CertificationResponse>(
    `/api/certifications/${encodeURIComponent(id)}`,
  );

  return response.data.certification;
};

export const createCertification = async (
  input: CreateCertificationInput,
): Promise<AdminCertification> => {
  const response = await requestApi<CertificationResponse>(
    "/api/certifications",
    {
      method: "POST",
      body: input,
    },
  );

  return response.data.certification;
};

export const updateCertification = async (
  id: string,
  input: UpdateCertificationInput,
): Promise<AdminCertification> => {
  const response = await requestApi<CertificationResponse>(
    `/api/certifications/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: input,
    },
  );

  return response.data.certification;
};

export const deleteCertification = async (id: string): Promise<void> => {
  await requestApi<{ deleted: boolean; id: string }>(
    `/api/certifications/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
};

export const replaceCertificationImage = async ({
  id,
  file,
  alt,
}: {
  id: string;
  file: File;
  alt: string;
}): Promise<AdminCertification> => {
  const body = new FormData();
  body.append("file", file);
  body.append("alt", alt);

  const response = await requestApi<CertificationResponse>(
    `/api/certifications/${encodeURIComponent(id)}/image`,
    {
      method: "PATCH",
      body,
    },
  );

  return response.data.certification;
};

export const toggleCertificationVisibility = async (
  id: string,
  isVisible: boolean,
): Promise<AdminCertification> => {
  const response = await requestApi<CertificationResponse>(
    `/api/certifications/${encodeURIComponent(id)}/visibility`,
    {
      method: "PATCH",
      body: { isVisible },
    },
  );

  return response.data.certification;
};

export const reorderCertifications = async (
  orderedIds: string[],
): Promise<AdminCertification[]> => {
  const response = await requestApi<CertificationsResponse>(
    "/api/certifications/reorder",
    {
      method: "PATCH",
      body: { orderedIds },
    },
  );

  return response.data.certifications;
};
