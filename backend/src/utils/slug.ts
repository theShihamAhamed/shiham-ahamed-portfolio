export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const generateSlug = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export const isValidSlug = (value: string): boolean => slugPattern.test(value);
