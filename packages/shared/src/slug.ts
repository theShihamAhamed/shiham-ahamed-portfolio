export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const generateSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const isValidSlug = (value: string) => slugPattern.test(value);
