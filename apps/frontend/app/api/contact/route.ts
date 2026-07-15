import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

import { getContactEmailConfig } from "@/lib/server/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTACT_THROTTLE_WINDOW_MS = 10 * 60 * 1000;
const CONTACT_THROTTLE_LIMIT = 5;

type ThrottleEntry = {
  count: number;
  resetAt: number;
};

declare global {
  var __portfolioContactThrottle:
    | Map<string, ThrottleEntry>
    | undefined;
}

const contactThrottle =
  globalThis.__portfolioContactThrottle ?? new Map<string, ThrottleEntry>();

globalThis.__portfolioContactThrottle = contactThrottle;

const contactSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Please enter your name.")
      .max(120, "Name must be 120 characters or less."),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address.")
      .max(254, "Email must be 254 characters or less."),
    subject: z
      .string()
      .trim()
      .min(1, "Please enter a subject.")
      .max(160, "Subject must be 160 characters or less."),
    message: z
      .string()
      .trim()
      .min(10, "Message must be at least 10 characters.")
      .max(5000, "Message must be 5000 characters or less."),
    website: z.string().trim().max(200).optional().default(""),
  })
  .strict();

type ContactPayload = z.infer<typeof contactSchema>;

const jsonSuccess = () =>
  NextResponse.json({
    success: true,
    message: "Message sent successfully.",
  });

const jsonError = (
  status: number,
  code: string,
  message: string,
  fieldErrors?: Record<string, string[] | undefined>,
) =>
  NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(fieldErrors ? { fieldErrors } : {}),
      },
    },
    { status },
  );

const getClientIp = (request: NextRequest) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    forwardedIp ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
};

const registerThrottleAttempt = (key: string) => {
  const now = Date.now();

  if (contactThrottle.size > 500) {
    for (const [entryKey, entry] of contactThrottle.entries()) {
      if (entry.resetAt <= now) {
        contactThrottle.delete(entryKey);
      }
    }
  }

  const entry = contactThrottle.get(key);

  if (!entry || entry.resetAt <= now) {
    contactThrottle.set(key, {
      count: 1,
      resetAt: now + CONTACT_THROTTLE_WINDOW_MS,
    });

    return {
      limited: false,
      retryAfterSeconds: Math.ceil(CONTACT_THROTTLE_WINDOW_MS / 1000),
    };
  }

  if (entry.count >= CONTACT_THROTTLE_LIMIT) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;

  return {
    limited: false,
    retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
  };
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });

const normalizeHeaderValue = (value: string) =>
  value.replace(/[\r\n]+/g, " ").trim();

const buildTextBody = (payload: ContactPayload) => `New portfolio contact message

Name: ${payload.name}
Visitor email: ${payload.email}
Subject: ${payload.subject}

Message:
${payload.message}`;

const buildHtmlBody = (payload: ContactPayload) => `
  <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
    <h2 style="margin: 0 0 16px;">New portfolio contact message</h2>
    <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Visitor email:</strong> ${escapeHtml(payload.email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>
    <div style="margin-top: 20px;">
      <strong>Message:</strong>
      <div style="margin-top: 8px; white-space: pre-wrap;">${escapeHtml(
        payload.message,
      )}</div>
    </div>
  </div>
`;

const isRateLimitOrQuotaError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const errorRecord = error as {
    name?: unknown;
    message?: unknown;
    statusCode?: unknown;
  };

  const name =
    typeof errorRecord.name === "string" ? errorRecord.name.toLowerCase() : "";
  const message =
    typeof errorRecord.message === "string"
      ? errorRecord.message.toLowerCase()
      : "";
  const statusCode =
    typeof errorRecord.statusCode === "number"
      ? errorRecord.statusCode
      : null;

  return (
    statusCode === 429 ||
    name === "rate_limit_exceeded" ||
    name === "daily_quota_exceeded" ||
    name === "monthly_quota_exceeded" ||
    message.includes("rate limit") ||
    message.includes("quota")
  );
};

const handleEmailProviderError = (context: string, error: unknown) => {
  console.error(context, error);

  if (isRateLimitOrQuotaError(error)) {
    return jsonError(
      429,
      "EMAIL_RATE_LIMITED",
      "The message service is temporarily busy. Please try again shortly or email me directly.",
    );
  }

  return jsonError(
    503,
    "EMAIL_TEMPORARILY_UNAVAILABLE",
    "The message service is temporarily unavailable. Please try again shortly or email me directly.",
  );
};

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError(
      400,
      "INVALID_JSON",
      "Please send a valid JSON request body.",
    );
  }

  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(
      422,
      "VALIDATION_ERROR",
      "Please check the highlighted fields.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const payload = parsed.data;

  if (payload.website) {
    return jsonSuccess();
  }

  const throttle = registerThrottleAttempt(`contact:${getClientIp(request)}`);

  if (throttle.limited) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMITED",
          message:
            "Too many messages were sent recently. Please wait a few minutes and try again.",
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(throttle.retryAfterSeconds),
        },
      },
    );
  }

  let config: ReturnType<typeof getContactEmailConfig>;

  try {
    config = getContactEmailConfig();
  } catch (error) {
    console.error("Contact email configuration is missing", error);

    return jsonError(
      503,
      "EMAIL_TEMPORARILY_UNAVAILABLE",
      "The message service is temporarily unavailable. Please email me directly.",
    );
  }

  const resend = new Resend(config.resendApiKey);

  try {
    const result = await resend.emails.send({
      from: config.fromEmail,
      to: config.toEmail,
      replyTo: payload.email,
      subject: `Portfolio contact: ${normalizeHeaderValue(payload.subject)}`,
      text: buildTextBody(payload),
      html: buildHtmlBody(payload),
    });

    if (result.error) {
      return handleEmailProviderError(
        "Resend rejected contact message",
        result.error,
      );
    }

    return jsonSuccess();
  } catch (error) {
    return handleEmailProviderError("Resend contact send failed", error);
  }
}
