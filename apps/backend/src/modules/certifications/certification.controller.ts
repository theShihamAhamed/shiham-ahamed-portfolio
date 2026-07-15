import { AppError } from "../../utils/app-error";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { revalidatePublicCache } from "../../lib/revalidate-public-cache";
import {
  createCertification,
  deleteCertification,
  getAdminCertificationById,
  getAdminCertifications,
  getVisibleCertifications,
  reorderCertifications,
  replaceCertificationImage,
  toggleCertificationVisibility,
  updateCertification,
} from "./certification.service";
import {
  serializeAdminCertification,
  serializePublicCertification,
} from "./certification.serializer";
import type {
  AdminCertificationQueryInput,
  CreateCertificationInput,
  UpdateCertificationInput,
} from "./certification.validation";

const getRequestFile = (file: Express.Multer.File | undefined) => {
  if (!file) {
    throw new AppError("Image file is required", 400, "FILE_REQUIRED");
  }

  return file;
};

const revalidateCertificationCache = (
  action: "create" | "update" | "delete",
  context: string,
) => {
  void revalidatePublicCache({ entity: "certification", action }, context);
};

export const listAdminCertifications = asyncHandler(async (req, res) => {
  const certifications = await getAdminCertifications(
    (res.locals.validated?.query ?? req.query) as AdminCertificationQueryInput,
  );

  return sendSuccess(
    res,
    {
      certifications: certifications.map(serializeAdminCertification),
    },
    200,
    { meta: { count: certifications.length } },
  );
});

export const getAdminCertification = asyncHandler(async (req, res) => {
  const certification = await getAdminCertificationById(String(req.params.id));

  return sendSuccess(res, {
    certification: serializeAdminCertification(certification),
  });
});

export const listVisibleCertifications = asyncHandler(async (_req, res) => {
  const certifications = await getVisibleCertifications();

  return sendSuccess(
    res,
    {
      certifications: certifications.map(serializePublicCertification),
    },
    200,
    { meta: { count: certifications.length } },
  );
});

export const createAdminCertification = asyncHandler(async (req, res) => {
  const certification = await createCertification(
    req.body as CreateCertificationInput,
  );
  revalidateCertificationCache("create", "certification create");

  return sendSuccess(
    res,
    {
      certification: serializeAdminCertification(certification),
    },
    201,
    { message: "Certification created successfully" },
  );
});

export const updateAdminCertification = asyncHandler(async (req, res) => {
  const certification = await updateCertification(
    String(req.params.id),
    req.body as UpdateCertificationInput,
  );
  revalidateCertificationCache("update", "certification update");

  return sendSuccess(
    res,
    {
      certification: serializeAdminCertification(certification),
    },
    200,
    { message: "Certification updated successfully" },
  );
});

export const deleteAdminCertification = asyncHandler(async (req, res) => {
  await deleteCertification(String(req.params.id));
  revalidateCertificationCache("delete", "certification delete");

  return sendSuccess(
    res,
    {
      deleted: true,
      id: String(req.params.id),
    },
    200,
    { message: "Certification deleted successfully" },
  );
});

export const replaceAdminCertificationImage = asyncHandler(async (req, res) => {
  const certification = await replaceCertificationImage(
    String(req.params.id),
    getRequestFile(req.file),
    String(req.body.alt),
  );
  revalidateCertificationCache("update", "certification image replacement");

  return sendSuccess(
    res,
    {
      certification: serializeAdminCertification(certification),
    },
    200,
    { message: "Certification image replaced successfully" },
  );
});

export const updateCertificationVisibility = asyncHandler(async (req, res) => {
  const certification = await toggleCertificationVisibility(
    String(req.params.id),
    Boolean(req.body.isVisible),
  );
  revalidateCertificationCache("update", "certification visibility update");

  return sendSuccess(
    res,
    {
      certification: serializeAdminCertification(certification),
    },
    200,
    { message: "Certification visibility updated successfully" },
  );
});

export const reorderAdminCertifications = asyncHandler(async (req, res) => {
  const certifications = await reorderCertifications(req.body.orderedIds);
  revalidateCertificationCache("update", "certification reorder");

  return sendSuccess(
    res,
    {
      certifications: certifications.map(serializeAdminCertification),
    },
    200,
    {
      message: "Certifications reordered successfully",
      meta: { count: certifications.length },
    },
  );
});
