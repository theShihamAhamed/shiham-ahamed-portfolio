import { timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { getRevalidateSecret } from "@/lib/server/env";
import {
  getPublicCacheTagsForRevalidation,
  publicRevalidationOperationSchema,
} from "@/lib/server/cache/cache-tags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4_096;

const noStoreHeaders = { "Cache-Control": "no-store" };

const jsonError = (status: number, code: string, message: string) =>
  NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status, headers: noStoreHeaders },
  );

const getBearerToken = (request: NextRequest) => {
  const authorization = request.headers.get("authorization") ?? "";
  const [scheme, token, ...extra] = authorization.trim().split(/\s+/);

  return scheme?.toLowerCase() === "bearer" && token && extra.length === 0
    ? token
    : undefined;
};

const secretsMatch = (provided: string | undefined, expected: string) => {
  if (!provided) return false;

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(providedBuffer, expectedBuffer);
};

export async function POST(request: NextRequest) {
  let expectedSecret: string;

  try {
    expectedSecret = getRevalidateSecret();
  } catch (error) {
    console.error("Public cache revalidation secret is not configured", error);
    return jsonError(
      503,
      "REVALIDATION_UNAVAILABLE",
      "Cache revalidation is temporarily unavailable.",
    );
  }

  if (!secretsMatch(getBearerToken(request), expectedSecret)) {
    return jsonError(401, "UNAUTHORIZED", "Unauthorized.");
  }

  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return jsonError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Cache revalidation requests must use application/json.",
    );
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return jsonError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return jsonError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
    }
    body = JSON.parse(rawBody);
  } catch {
    return jsonError(400, "INVALID_JSON", "Please send a valid JSON body.");
  }

  const parsed = publicRevalidationOperationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please provide a valid public cache operation.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 422, headers: noStoreHeaders },
    );
  }

  try {
    const tags = getPublicCacheTagsForRevalidation(parsed.data);
    tags.forEach((tag) => revalidateTag(tag, { expire: 0 }));

    const operationMetadata = "group" in parsed.data
      ? { group: parsed.data.group }
      : {
          entity: parsed.data.entity,
          action: parsed.data.action,
        };

    return NextResponse.json(
      {
        success: true,
        revalidated: {
          ...operationMetadata,
          tags,
        },
      },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    const operationMetadata = "group" in parsed.data
      ? { group: parsed.data.group }
      : {
          entity: parsed.data.entity,
          action: parsed.data.action,
        };

    console.error("Public cache revalidation failed internally", {
      event: "public_cache_invalidation",
      ...operationMetadata,
      error: error instanceof Error ? error.name : "unknown_error",
    });
    return jsonError(
      500,
      "REVALIDATION_FAILED",
      "Cache revalidation failed unexpectedly.",
    );
  }
}
