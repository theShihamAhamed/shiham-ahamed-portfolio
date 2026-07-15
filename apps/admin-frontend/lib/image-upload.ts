export const IMAGE_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const IMAGE_UPLOAD_ACCEPT = IMAGE_UPLOAD_MIME_TYPES.join(",");
export const IMAGE_UPLOAD_MAX_SIZE_MB = 8;
export const IMAGE_UPLOAD_MAX_SIZE_BYTES =
  IMAGE_UPLOAD_MAX_SIZE_MB * 1024 * 1024;
export const IMAGE_UPLOAD_MAX_FILES = 20;

export type ImageFileLike = Pick<File, "name" | "size" | "type">;

export type ImageFileValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const validateImageFile = (
  file: ImageFileLike,
): ImageFileValidationResult => {
  if (!IMAGE_UPLOAD_MIME_TYPES.some((mimeType) => mimeType === file.type)) {
    return {
      valid: false,
      message: `${file.name} must be a JPEG, PNG, or WebP image.`,
    };
  }

  if (file.size > IMAGE_UPLOAD_MAX_SIZE_BYTES) {
    return {
      valid: false,
      message: `${file.name} is ${formatFileSize(file.size)}. Images cannot exceed ${IMAGE_UPLOAD_MAX_SIZE_MB} MB.`,
    };
  }

  return { valid: true };
};

export const validateImageFiles = (
  files: ImageFileLike[],
): ImageFileValidationResult => {
  if (files.length > IMAGE_UPLOAD_MAX_FILES) {
    return {
      valid: false,
      message: `Choose no more than ${IMAGE_UPLOAD_MAX_FILES} images at once.`,
    };
  }

  for (const file of files) {
    const result = validateImageFile(file);

    if (!result.valid) return result;
  }

  return { valid: true };
};

export const removeItemAt = <T>(items: T[], index: number): T[] =>
  items.filter((_, itemIndex) => itemIndex !== index);

export const replaceItemAt = <T>(
  items: T[],
  index: number,
  value: T,
): T[] => items.map((item, itemIndex) => (itemIndex === index ? value : item));
