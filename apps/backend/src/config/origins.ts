const originPattern = /^[a-z][a-z\d+.-]*:\/\/[^/]+$/i;

export const parseOriginList = (value: string): string[] => {
  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error("At least one browser origin is required");
  }

  const normalized = origins.map((origin) => {
    if (!originPattern.test(origin)) {
      throw new Error("Browser origins must be absolute origins without paths");
    }

    const parsed = new URL(origin);

    if (parsed.origin !== origin || parsed.username || parsed.password) {
      throw new Error("Browser origins must be exact origins without credentials");
    }

    return parsed.origin;
  });

  if (new Set(normalized).size !== normalized.length) {
    throw new Error("Browser origins must not contain duplicates");
  }

  return normalized;
};
