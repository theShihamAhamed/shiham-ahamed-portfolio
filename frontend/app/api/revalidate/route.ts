import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getRevalidateSecret } from "@/lib/server/env";
import {
  PUBLIC_CACHE_GROUP_NAMES,
  PUBLIC_CACHE_GROUPS,
  PUBLIC_CACHE_TAG_VALUES,
  type PublicCacheTag,
} from "@/lib/server/public-data/cache-tags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const revalidateBodySchema = z
  .object({
    tags: z.array(z.enum(PUBLIC_CACHE_TAG_VALUES)).min(1).optional(),
    groups: z.array(z.enum(PUBLIC_CACHE_GROUP_NAMES)).min(1).optional(),
  })
  .strict()
  .refine((body) => body.tags || body.groups, {
    message: "Provide at least one cache tag or group to revalidate.",
  });

const jsonError = (status: number, code: string, message: string) =>
  NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status },
  );

const getBearerToken = (request: NextRequest) => {
  const authorization = request.headers.get("authorization") ?? "";
  const [scheme, token] = authorization.split(" ");

  return scheme?.toLowerCase() === "bearer" ? token : undefined;
};

const uniqueTags = (tags: readonly PublicCacheTag[]) =>
  Array.from(new Set(tags));

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

  if (getBearerToken(request) !== expectedSecret) {
    return jsonError(401, "UNAUTHORIZED", "Unauthorized.");
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Please send a valid JSON body.");
  }

  const parsed = revalidateBodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please provide valid cache tags or groups.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 422 },
    );
  }

  const tagsFromGroups =
    parsed.data.groups?.flatMap((group) => PUBLIC_CACHE_GROUPS[group]) ?? [];
  const tags = uniqueTags([...(parsed.data.tags ?? []), ...tagsFromGroups]);

  tags.forEach((tag) => revalidateTag(tag, { expire: 0 }));

  return NextResponse.json({
    success: true,
    revalidated: {
      tags,
    },
  });
}
