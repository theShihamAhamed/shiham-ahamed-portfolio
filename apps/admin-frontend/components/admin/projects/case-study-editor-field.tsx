"use client";

import { getCaseStudyMdxValidationIssues } from "@portfolio/shared";
import rehypeSlug from "rehype-slug";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { UseFormRegisterReturn } from "react-hook-form";

import { FieldError } from "@/components/forms/field-error";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  registration: UseFormRegisterReturn;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

const isSafeUrl = (value: string) => {
  if ((value.startsWith("/") && !value.startsWith("//")) || value.startsWith("#")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export function CaseStudyEditorField({
  value,
  registration,
  error,
  disabled = false,
  onChange,
}: Props) {
  const validationIssues = getCaseStudyMdxValidationIssues(value);
  const hasPolicyError = validationIssues.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="caseStudyMdx">
            Case study content <span className="text-[var(--admin-muted)]">optional</span>
          </label>
          <p id="caseStudyMdx-help" className="mt-1 text-xs leading-5 text-[var(--admin-muted)]">
            Write the restricted Markdown/MDX subset used by the public case-study renderer. External article links remain separate below.
          </p>
        </div>
        <span className="text-xs text-[var(--admin-muted)]">
          {new TextEncoder().encode(value).length.toLocaleString()} / 100,000 bytes
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Textarea
            id="caseStudyMdx"
            className="min-h-72 font-mono text-xs leading-6"
            disabled={disabled}
            placeholder="# Case study\n\nExplain the problem, approach, and outcome."
            aria-invalid={error || hasPolicyError ? true : undefined}
            aria-describedby="caseStudyMdx-help caseStudyMdx-error"
            value={value}
            {...registration}
            onChange={(event) => {
              void registration.onChange(event);
              onChange(event.target.value);
            }}
          />
          <FieldError
            id="caseStudyMdx-error"
            message={error ?? validationIssues[0]?.message}
          />
        </div>

        <div className="min-h-72 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--admin-muted)]">
            Preview
          </p>
          {hasPolicyError ? (
            <p className="text-sm leading-6 text-red-700">
              Preview is unavailable until the content policy issues are fixed.
            </p>
          ) : value.trim() ? (
            <div className="prose prose-sm max-w-none text-[var(--admin-text)] dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                skipHtml
                urlTransform={(url) => (isSafeUrl(url) ? url : "")}
              >
                {value}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm leading-6 text-[var(--admin-muted)]">
              Add case-study content to see its public-style preview.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
