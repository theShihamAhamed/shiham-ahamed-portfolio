import { asyncHandler } from "../../utils/async-handler";
import { AppError } from "../../utils/app-error";
import { sendSuccess } from "../../utils/response";
import { deleteImage, uploadImage, uploadImages } from "./uploads.service";

const getUploadedFiles = (files: Express.Multer.File[] | undefined) => {
  if (!files || files.length === 0) {
    throw new AppError("At least one image file is required", 400, "FILES_REQUIRED");
  }

  return files;
};

export const uploadSingleImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Image file is required", 400, "FILE_REQUIRED");
  }

  const image = await uploadImage({
    file: req.file,
    folder: req.body.folder,
    alt: req.body.alt,
  });

  return sendSuccess(
    res,
    {
      image,
    },
    201,
    { message: "Image uploaded successfully" },
  );
});

export const uploadMultipleImages = asyncHandler(async (req, res) => {
  const files = getUploadedFiles(req.files as Express.Multer.File[] | undefined);
  const images = await uploadImages({
    files,
    folder: req.body.folder,
    alt: req.body.alt,
  });

  return sendSuccess(
    res,
    {
      images,
    },
    201,
    { message: "Images uploaded successfully" },
  );
});

export const deleteUploadedImage = asyncHandler(async (req, res) => {
  const fileId = String(req.params.fileId);

  await deleteImage(fileId);

  return sendSuccess(
    res,
    {
      deleted: true,
      fileId,
    },
    200,
    { message: "Image deleted successfully" },
  );
});
