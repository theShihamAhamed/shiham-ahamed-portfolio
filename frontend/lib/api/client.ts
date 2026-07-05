import type {
  PublicApiErrorResponse,
  PublicApiSuccessResponse,
} from "@/types/public-api";

type PublicApiErrorInput = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
};

export class PublicApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor({ status, code, message, details }: PublicApiErrorInput) {
    super(message);
    this.name = "PublicApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isSuccessEnvelope = <T>(
  value: unknown,
): value is PublicApiSuccessResponse<T> =>
  isRecord(value) && value.success === true && "data" in value;

const isErrorEnvelope = (value: unknown): value is PublicApiErrorResponse =>
  isRecord(value) &&
  value.success === false &&
  isRecord(value.error) &&
  typeof value.error.code === "string" &&
  typeof value.error.message === "string";

const parseJsonResponse = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    throw new PublicApiError({
      status: response.status,
      code: "INVALID_JSON",
      message: "The public API returned an invalid JSON response.",
    });
  }
};

const buildPublicApiUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return path.startsWith("/") ? path : `/${path}`;
};

export const requestPublicApiEnvelope = async <T>(
  path: string,
  init?: RequestInit,
): Promise<PublicApiSuccessResponse<T>> => {
  const headers = new Headers(init?.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const response = await fetch(buildPublicApiUrl(path), {
    cache: "no-store",
    ...init,
    headers,
  });
  const payload = await parseJsonResponse(response);

  if (!response.ok) {
    if (isErrorEnvelope(payload)) {
      throw new PublicApiError({
        status: response.status,
        code: payload.error.code,
        message: payload.error.message,
        details: payload.error.details,
      });
    }

    throw new PublicApiError({
      status: response.status,
      code: "PUBLIC_API_REQUEST_FAILED",
      message: `The public API request failed with status ${response.status}.`,
    });
  }

  if (isSuccessEnvelope<T>(payload)) {
    return payload;
  }

  if (isErrorEnvelope(payload)) {
    throw new PublicApiError({
      status: response.status,
      code: payload.error.code,
      message: payload.error.message,
      details: payload.error.details,
    });
  }

  throw new PublicApiError({
    status: response.status,
    code: "INVALID_RESPONSE_ENVELOPE",
    message: "The public API returned an unexpected response envelope.",
  });
};

export const requestPublicApi = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const envelope = await requestPublicApiEnvelope<T>(path, init);

  return envelope.data;
};
