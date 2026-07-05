import type { ApiErrorResponse, ApiSuccessResponse } from "@/types/api";
import type { AuthSession } from "@/types/auth";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

type RequestBody = BodyInit | Record<string, unknown> | undefined;

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: RequestBody;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
};

type ApiClientAuthConfig = {
  getAccessToken: () => string | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  onSessionExpired: () => void;
};

type RefreshResponseData = AuthSession;

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor({
    status,
    code,
    message,
    details,
  }: {
    status: number;
    code: string;
    message: string;
    details?: unknown;
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let authConfig: ApiClientAuthConfig | null = null;
let refreshPromise: Promise<AuthSession> | null = null;

export function configureApiClient(config: ApiClientAuthConfig) {
  authConfig = config;
}

const toApiUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const isJsonBody = (body: RequestBody): body is Record<string, unknown> => {
  return (
    body !== undefined &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !(body instanceof URLSearchParams) &&
    typeof body !== "string"
  );
};

const buildRequestInit = (options: ApiRequestOptions = {}): RequestInit => {
  const {
    auth = true,
    body: rawBody,
    ...init
  } = options;
  const headers = new Headers(options.headers);
  let body = rawBody as BodyInit | undefined;

  if (isJsonBody(rawBody)) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(rawBody);
  }

  if (auth) {
    const accessToken = authConfig?.getAccessToken();

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  return {
    ...init,
    headers,
    body,
  };
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const normalizeApiError = (response: Response, body: unknown): ApiError => {
  const maybeError = body as Partial<ApiErrorResponse> | undefined;

  if (
    maybeError?.success === false &&
    typeof maybeError.error?.message === "string"
  ) {
    return new ApiError({
      status: response.status,
      code: maybeError.error.code ?? `HTTP_${response.status}`,
      message: maybeError.error.message,
      details: maybeError.error.details,
    });
  }

  return new ApiError({
    status: response.status,
    code: "REQUEST_FAILED",
    message: response.statusText || "Request failed",
    details: body,
  });
};

const parseSuccessResponse = <T>(
  response: Response,
  body: unknown,
): ApiSuccessResponse<T> => {
  const maybeSuccess = body as Partial<ApiSuccessResponse<T>> | undefined;

  if (maybeSuccess?.success === true && "data" in maybeSuccess) {
    return maybeSuccess as ApiSuccessResponse<T>;
  }

  throw new ApiError({
    status: response.status,
    code: "INVALID_API_RESPONSE",
    message: "The API response shape was not recognized.",
    details: body,
  });
};

const performRefresh = async (): Promise<AuthSession> => {
  const response = await fetch(toApiUrl("/api/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
    credentials: "include",
  });
  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw normalizeApiError(response, body);
  }

  const success = parseSuccessResponse<RefreshResponseData>(response, body);
  authConfig?.setSession(success.data);

  return success.data;
};

export const refreshAccessToken = async (): Promise<AuthSession> => {
  refreshPromise ??= performRefresh().finally(() => {
    refreshPromise = null;
  });

  try {
    return await refreshPromise;
  } catch (error) {
    authConfig?.clearSession();
    throw error;
  }
};

export const requestApi = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiSuccessResponse<T>> => {
  const { retryOnUnauthorized = true, ...requestOptions } = options;
  const response = await fetch(toApiUrl(path), buildRequestInit(requestOptions));
  const body = await parseResponseBody(response);

  if (response.status === 401 && retryOnUnauthorized) {
    try {
      await refreshAccessToken();

      return requestApi<T>(path, {
        ...requestOptions,
        retryOnUnauthorized: false,
      });
    } catch {
      authConfig?.onSessionExpired();
    }
  }

  if (!response.ok) {
    throw normalizeApiError(response, body);
  }

  return parseSuccessResponse<T>(response, body);
};
