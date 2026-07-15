import { timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { getRevalidateSecret } from "@/lib/server/env";
import {
  getPublicCacheTagsForRevalidation,
  publicRevalidationRequestSchema,
} from "@/lib/server/cache/cache-tags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4_096;

const jsonError = (status: number, code: string, message: string) =>
  NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status },
  );

const getBearerToken = (request: NextRequest) => {
  const authorization = request.headers.get("authorization") ?? "";
  const [scheme, token] = authorization.split(" ");

  return scheme?.toLowerCase() === "bearer" && token ? token : undefined;
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

  const parsed = publicRevalidationRequestSchema.safeParse(body);
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
      { status: 422 },
    );
  }

  const tags = getPublicCacheTagsForRevalidation(parsed.data);
  tags.forEach((tag) => revalidateTag(tag, { expire: 0 }));

  return NextResponse.json({
    success: true,
    revalidated: {
      entity: parsed.data.entity,
      action: parsed.data.action,
      tags,
    },
  });
}
