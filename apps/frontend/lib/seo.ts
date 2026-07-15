import { getPublicSiteUrl } from "@/lib/server/env";

export const getCanonicalUrl = (pathname = "/") => {
  const url = getPublicSiteUrl();
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  url.pathname = normalizedPath;
  url.search = "";
  url.hash = "";
  return url;
};

export const getAbsoluteUrl = (value: string) => {
  return new URL(value, getPublicSiteUrl()).toString();
};

export const getMetadataDescription = (value: string, maxLength = 160) => {
  const normalized = value
    .replace(/[#*_`>\[\]()]*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength - 1).trimEnd()}…`
    : normalized;
};
