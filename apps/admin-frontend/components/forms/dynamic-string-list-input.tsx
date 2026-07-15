"use client";

import { Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DynamicStringListInputProps = {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  minItems?: number;
  emptyMessage?: string;
};

export function DynamicStringListInput({
  label,
  value,
  onChange,
  placeholder = "Add item",
  addLabel = "Add item",
  minItems = 0,
  emptyMessage = "No items added yet.",
}: DynamicStringListInputProps) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const trimmedDraft = draft.trim();

  const addItem = () => {
    if (!trimmedDraft) {
      return;
    }

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

  const belowMinimum = minItems > 0 && value.length < minItems;

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor={id}
          className="text-sm font-medium text-[var(--admin-text)]"
        >
          {label}
        </label>
        {belowMinimum ? (
          <p className="mt-1 text-xs text-amber-700">
            Add at least {minItems} item{minItems === 1 ? "" : "s"}.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={id}
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addItem();
            }
          }}
        />
        <Button
          type="button"
          onClick={addItem}
          disabled={!trimmedDraft}
          className="shrink-0 whitespace-nowrap"
        >
          <Plus className="size-4 shrink-0" aria-hidden="true" />
          {addLabel}
        </Button>
      </div>

      {value.length > 0 ? (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={`${label}-${index}`} className="flex gap-2">
              <Input
                value={item}
                aria-label={`${label} ${index + 1}`}
                onChange={(event) => updateItem(index, event.target.value)}
              />
              <Button
                variant="secondary"
                size="sm"
                className="h-10 px-3"
                onClick={() => removeItem(index)}
                aria-label={`Remove ${label} ${index + 1}`}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-4 py-3 text-sm text-[var(--admin-muted)]">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
