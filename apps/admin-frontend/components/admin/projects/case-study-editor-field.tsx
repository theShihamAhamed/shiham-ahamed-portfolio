"use client";

import {
  CASE_STUDY_MDX_MAX_BYTES,
  getCaseStudyMdxValidationIssues,
  getUtf8ByteLength,
} from "@portfolio/shared";
import { ChevronRight, Eye, FilePenLine } from "lucide-react";
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { CaseStudyReadmeRenderer } from "@/components/admin/projects/case-study-readme-renderer";
import { FieldError } from "@/components/forms/field-error";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  registration: UseFormRegisterReturn;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

type EditorTab = "edit" | "preview";

const tabs: Array<{ id: EditorTab; label: string }> = [
  { id: "edit", label: "Edit" },
  { id: "preview", label: "Preview" },
];

const tabId = (tab: EditorTab) => `caseStudyMdx-tab-${tab}`;
const panelId = (tab: EditorTab) => `caseStudyMdx-panel-${tab}`;

export function CaseStudyEditorField({
  value,
  registration,
  error,
  disabled = false,
  onChange,
}: Props) {
  const [activeTab, setActiveTab] = useState<EditorTab>("edit");
  const tabRefs = {
    edit: useRef<HTMLButtonElement>(null),
    preview: useRef<HTMLButtonElement>(null),
  };
  const validationIssues = getCaseStudyMdxValidationIssues(value);
  const policyMessage = validationIssues[0]?.message;
  const fieldMessage = error ?? policyMessage;
  const hasPolicyError = Boolean(policyMessage);

  const selectTab = (tab: EditorTab, moveFocus = false) => {
    setActiveTab(tab);
    if (moveFocus) {
      requestAnimationFrame(() => tabRefs[tab].current?.focus());
    }
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const nextTab =
      event.key === "ArrowRight"
        ? activeTab === "edit"
          ? "preview"
          : "edit"
        : activeTab === "preview"
          ? "edit"
          : "preview";
    selectTab(nextTab, true);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="caseStudyMdx">
            README / Case study <span className="text-[var(--admin-muted)]">optional</span>
          </label>
          <p id="caseStudyMdx-help" className="mt-1 max-w-3xl text-xs leading-5 text-[var(--admin-muted)]">
            Paste GitHub-Flavoured Markdown. Safe README HTML such as centered sections, images, badges, tables, details, and summaries is supported.
          </p>
        </div>
        <span className={`text-xs ${hasPolicyError ? "text-red-700" : "text-[var(--admin-muted)]"}`}>
          {getUtf8ByteLength(value).toLocaleString()} / {CASE_STUDY_MDX_MAX_BYTES.toLocaleString()} bytes
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]">
        <div className="border-b border-[var(--admin-border)] px-2 pt-2">
          <div role="tablist" aria-label="Case study editor view" className="flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.id === "edit" ? FilePenLine : Eye;
              return (
                <button
                  key={tab.id}
                  ref={tabRefs[tab.id]}
                  type="button"
                  role="tab"
                  id={tabId(tab.id)}
                  aria-selected={isActive}
                  aria-controls={panelId(tab.id)}
                  tabIndex={isActive ? 0 : -1}
                  disabled={disabled}
                  onClick={() => selectTab(tab.id)}
                  onKeyDown={handleTabKeyDown}
                  className={`inline-flex items-center gap-2 rounded-t-lg border-b-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)] ${isActive ? "border-[var(--admin-accent)] text-[var(--admin-text)]" : "border-transparent text-[var(--admin-muted)] hover:bg-[var(--admin-surface-muted)] hover:text-[var(--admin-text)]"}`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "edit" ? (
          <div
            id={panelId("edit")}
            role="tabpanel"
            aria-labelledby={tabId("edit")}
            className="p-3 sm:p-4"
          >
            <Textarea
              id="caseStudyMdx"
              className="min-h-[28rem] resize-y rounded-lg font-mono text-xs leading-6 sm:min-h-[34rem] sm:text-sm"
              disabled={disabled}
              placeholder={'# Project title\n\n<p align="center">\n  <img src="https://example.com/logo.png" width="160" alt="Project logo" />\n</p>\n\nDescribe the problem, approach, and outcome.'}
              wrap="soft"
              spellCheck={false}
              aria-invalid={fieldMessage ? true : undefined}
              aria-describedby="caseStudyMdx-help caseStudyMdx-error"
              {...registration}
              value={value}
              onChange={(event) => {
                void registration.onChange(event);
                onChange(event.target.value);
              }}
            />
            <FieldError id="caseStudyMdx-error" message={fieldMessage} />
          </div>
        ) : (
          <div
            id={panelId("preview")}
            role="tabpanel"
            aria-labelledby={tabId("preview")}
            className="min-h-[28rem] bg-[var(--admin-surface-muted)] p-4 sm:min-h-[34rem] sm:p-6"
          >
            {fieldMessage ? (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                Preview is unavailable until this content policy issue is fixed: {fieldMessage}
              </div>
            ) : value.trim() ? (
              <div className="max-w-none overflow-hidden text-[var(--admin-text)]">
                <CaseStudyReadmeRenderer source={value} />
              </div>
            ) : (
              <div className="flex min-h-[24rem] items-center justify-center rounded-lg border border-dashed border-[var(--admin-border)] px-6 text-center text-sm leading-6 text-[var(--admin-muted)]">
                Add README content in the Edit tab to see a GitHub-style preview.
              </div>
            )}
          </div>
        )}
      </div>

      <p className="flex items-center gap-1 text-xs text-[var(--admin-muted)]">
        <ChevronRight className="size-3.5" aria-hidden="true" />
        External article links remain separate from the README content.
      </p>
    </div>
  );
}
