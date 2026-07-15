const youtubeVideoIdPattern = /^[A-Za-z0-9_-]{11}$/;

const youtubeHosts = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

export type YouTubeEmbedSource = {
  videoId: string;
  embedUrl: string;
  autoplayEmbedUrl: string;
};

const parseHttpUrl = (value: string) => {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }

    return url;
  } catch {
    return undefined;
  }
};

const getValidVideoId = (value: string | null | undefined) => {
  const candidate = value?.trim().split(/[?&#]/)[0];

  if (!candidate || !youtubeVideoIdPattern.test(candidate)) {
    return undefined;
  }

  return candidate;
};

const getPathSegments = (url: URL) =>
  url.pathname.split("/").filter(Boolean);

export const getYouTubeVideoId = (videoUrl: string | undefined) => {
  const trimmedUrl = videoUrl?.trim();

  if (!trimmedUrl) {
    return undefined;
  }

  const parsedUrl = parseHttpUrl(trimmedUrl);

  if (!parsedUrl || !youtubeHosts.has(parsedUrl.hostname.toLowerCase())) {
    return undefined;
  }

  const host = parsedUrl.hostname.toLowerCase();
  const segments = getPathSegments(parsedUrl);

  if (host === "youtu.be") {
    return getValidVideoId(segments[0]);
  }

  if (segments[0] === "watch") {
    return getValidVideoId(parsedUrl.searchParams.get("v"));
  }

  if (segments[0] === "embed" || segments[0] === "shorts") {
    return getValidVideoId(segments[1]);
  }

  return undefined;
};

const buildYouTubeEmbedUrl = (videoId: string, autoplay = false) => {
  const embedUrl = new URL(
    `https://www.youtube-nocookie.com/embed/${videoId}`,
  );

  embedUrl.searchParams.set("rel", "0");
  embedUrl.searchParams.set("modestbranding", "1");
  embedUrl.searchParams.set("playsinline", "1");

  if (autoplay) {
    embedUrl.searchParams.set("autoplay", "1");
  }

  return embedUrl.toString();
};

export const getYouTubeEmbedSource = (
  videoUrl: string | undefined,
): YouTubeEmbedSource | undefined => {
  const videoId = getYouTubeVideoId(videoUrl);

  if (!videoId) {
    return undefined;
  }

  return {
    videoId,
    embedUrl: buildYouTubeEmbedUrl(videoId),
    autoplayEmbedUrl: buildYouTubeEmbedUrl(videoId, true),
  };
};

export const isYouTubeVideoUrl = (videoUrl: string | undefined) =>
  Boolean(getYouTubeVideoId(videoUrl));
