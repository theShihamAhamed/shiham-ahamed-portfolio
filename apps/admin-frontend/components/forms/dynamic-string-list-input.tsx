"use client";

import { Plus, Trash2 } from "lucide-react";
import { useId, useState, type ChangeEvent, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type DynamicStringListInputProps = {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  minItems?: number;
  maxItems?: number;
  maxLength?: number;
  helpText?: string;
  showCharacterCount?: boolean;
  countLabel?: string;
  multiline?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  disabled?: boolean;
};

const getTrimmedLength = (value: string) => value.trim().length;

export function DynamicStringListInput({
  label,
  value,
  onChange,
  placeholder = "Add item",
  addLabel = "Add item",
  minItems = 0,
  maxItems,
  maxLength,
  helpText,
  showCharacterCount = false,
  countLabel = "items",
  multiline = false,
  errorMessage,
  emptyMessage = "No items added yet.",
  disabled = false,
}: DynamicStringListInputProps) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const trimmedDraft = draft.trim();
  const draftLength = getTrimmedLength(draft);
  const draftOverMaximum = maxLength !== undefined && draftLength > maxLength;
  const atMaximum = maxItems !== undefined && value.length >= maxItems;
  const belowMinimum = minItems > 0 && value.length < minItems;
  const helpId = helpText ? `${id}-help` : undefined;
  const draftCountId = showCharacterCount && maxLength ? `${id}-draft-count` : undefined;
  const maximumId = atMaximum ? `${id}-maximum` : undefined;
  const errorId = errorMessage ? `${id}-error` : undefined;
  const describedBy = [helpId, draftCountId, maximumId, errorId]
    .filter(Boolean)
    .join(" ") || undefined;

  const addItem = () => {
    if (!trimmedDraft || draftOverMaximum || atMaximum || disabled) return;

    onChange([...value, trimmedDraft]);
    setDraft("");
  };

  const updateItem = (index: number, nextValue: string) => {
    onChange(
      value.map((item, itemIndex) => (itemIndex === index ? nextValue : item)),
    );
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleDraftKeyDown = (
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const shouldAdd = multiline
      ? event.key === "Enter" && (event.ctrlKey || event.metaKey)
      : event.key === "Enter";

    if (shouldAdd) {
      event.preventDefault();
      addItem();
    }
  };

  const draftProps = {
    id,
    value: draft,
    placeholder,
    disabled: disabled || atMaximum,
    "aria-invalid": draftOverMaximum || Boolean(errorMessage) || undefined,
    "aria-describedby": describedBy,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft(event.target.value),
    onKeyDown: handleDraftKeyDown,
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <label
            htmlFor={id}
            className="text-sm font-medium text-[var(--admin-text)]"
          >
            {label}
          </label>
          {maxItems !== undefined ? (
            <span className="text-xs tabular-nums text-[var(--admin-muted)]">
              {value.length} / {maxItems} {countLabel}
            </span>
          ) : null}
        </div>
        {helpText ? (
          <p id={helpId} className="mt-1 text-xs leading-5 text-[var(--admin-muted)]">
            {helpText}
          </p>
        ) : null}
        {belowMinimum ? (
          <p className="mt-1 text-xs text-amber-700">
            Add at least {minItems} item{minItems === 1 ? "" : "s"}.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          {multiline ? (
            <Textarea {...draftProps} className="min-h-24" />
          ) : (
            <Input {...draftProps} />
          )}
          {showCharacterCount && maxLength ? (
            <p
              id={draftCountId}
              className={`mt-1 text-right text-xs tabular-nums ${draftOverMaximum ? "text-red-700" : "text-[var(--admin-muted)]"}`}
            >
              {draftLength} / {maxLength} characters
            </p>
          ) : null}
          {multiline ? (
            <p className="mt-1 text-xs text-[var(--admin-muted)]">
              Press Ctrl+Enter or Command+Enter to add this paragraph.
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          onClick={addItem}
          disabled={disabled || atMaximum || !trimmedDraft || draftOverMaximum}
          className="shrink-0 whitespace-nowrap"
        >
          <Plus className="size-4 shrink-0" aria-hidden="true" />
          {addLabel}
        </Button>
      </div>

      {atMaximum ? (
        <p
          id={maximumId}
          className="text-xs text-[var(--admin-muted)]"
          aria-live="polite"
        >
          Maximum of {maxItems} {countLabel} reached. Remove one to add another.
        </p>
      ) : null}

      {value.length > 0 ? (
        <div className="space-y-2">
          {value.map((item, index) => {
            const itemLength = getTrimmedLength(item);
            const itemOverMaximum = maxLength !== undefined && itemLength > maxLength;
            const itemCountId = `${id}-item-${index}-count`;

            return (
              <div key={`${label}-${index}`} className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  {multiline ? (
                    <Textarea
                      value={item}
                      disabled={disabled}
                      className="min-h-20"
                      aria-label={`${label} ${index + 1}`}
                      aria-invalid={itemOverMaximum || undefined}
                      aria-describedby={showCharacterCount && maxLength ? itemCountId : undefined}
                      onChange={(event) => updateItem(index, event.target.value)}
                    />
                  ) : (
                    <Input
                      value={item}
                      disabled={disabled}
                      aria-label={`${label} ${index + 1}`}
                      aria-invalid={itemOverMaximum || undefined}
                      aria-describedby={showCharacterCount && maxLength ? itemCountId : undefined}
                      onChange={(event) => updateItem(index, event.target.value)}
                    />
                  )}
                  {showCharacterCount && maxLength ? (
                    <p
                      id={itemCountId}
                      className={`mt-1 text-right text-xs tabular-nums ${itemOverMaximum ? "text-red-700" : "text-[var(--admin-muted)]"}`}
                    >
                      {itemLength} / {maxLength} characters
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-10 px-3"
                  disabled={disabled}
                  onClick={() => removeItem(index)}
                  aria-label={`Remove ${label} ${index + 1}`}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-4 py-3 text-sm text-[var(--admin-muted)]">
          {emptyMessage}
        </div>
      )}

      {errorMessage ? (
        <p id={errorId} className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
