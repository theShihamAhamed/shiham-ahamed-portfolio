"use client";

import { Plus, Trash2 } from "lucide-react";
import { useId, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  defaultTechColor,
  findTechColorByHex,
  techColorPalette,
} from "@/lib/tech-color-palette";
import type { ProjectTechStackItem } from "@/types/project";

type TechStackInputProps = {
  value: ProjectTechStackItem[];
  onChange: (value: ProjectTechStackItem[]) => void;
};

const emptyTechItem: ProjectTechStackItem = {
  label: "",
  category: "",
  color: defaultTechColor.hex,
  showOnCard: false,
};

const uncategorizedLabel = "Uncategorized";

type TechStackGroup = {
  key: string;
  name: string;
  itemIndexes: number[];
  localGroupId?: string;
  isUncategorized: boolean;
  isEmptyLocalGroup: boolean;
};

type EmptyTechStackGroup = {
  id: string;
  name: string;
};

const getCategoryName = (category: string | undefined) =>
  category?.trim() || uncategorizedLabel;

const toCategoryValue = (groupName: string) => {
  const trimmedGroupName = groupName.trim();

  return trimmedGroupName === uncategorizedLabel ? "" : trimmedGroupName;
};

const getUniqueGroupName = (groups: TechStackGroup[]) => {
  const names = new Set(groups.map((group) => group.name));

  if (!names.has("New group")) {
    return "New group";
  }

  let index = 2;

  while (names.has(`New group ${index}`)) {
    index += 1;
  }

  return `New group ${index}`;
};

const getColorSummary = (color?: string) => {
  const selectedColor = findTechColorByHex(color);

  return {
    name: selectedColor?.name ?? "Custom",
    hex: color || defaultTechColor.hex,
  };
};

export function TechStackInput({ value, onChange }: TechStackInputProps) {
  const idPrefix = useId();
  const [emptyGroups, setEmptyGroups] = useState<EmptyTechStackGroup[]>([]);
  const selectedCardTagCount = value.filter((item) => item.showOnCard).length;

  const groups = useMemo<TechStackGroup[]>(() => {
    const groupedItems = new Map<string, TechStackGroup>();

    value.forEach((item, index) => {
      const name = getCategoryName(item.category);
      const key = item.category?.trim() ? name : "__uncategorized";
      const existingGroup = groupedItems.get(key);

      if (existingGroup) {
        existingGroup.itemIndexes.push(index);
        return;
      }

      groupedItems.set(key, {
        key: `saved-${index}`,
        name,
        itemIndexes: [index],
        isUncategorized: key === "__uncategorized",
        isEmptyLocalGroup: false,
      });
    });

    const groupsFromValue = Array.from(groupedItems.values());
    const valueGroupNames = new Set(groupsFromValue.map((group) => group.name));
    const localGroups = emptyGroups
      .filter((group) => !valueGroupNames.has(group.name))
      .map<TechStackGroup>((group) => ({
        key: `local-${group.id}`,
        name: group.name,
        itemIndexes: [],
        localGroupId: group.id,
        isUncategorized: false,
        isEmptyLocalGroup: true,
      }));

    return [...groupsFromValue, ...localGroups];
  }, [emptyGroups, value]);

  const addGroup = () => {
    const nextGroupName = getUniqueGroupName(groups);

    setEmptyGroups((currentGroups) => [
      ...currentGroups,
      {
        id: `${idPrefix}-${currentGroups.length}-${Date.now()}`,
        name: nextGroupName,
      },
    ]);
  };

  const addItemToGroup = (group: TechStackGroup) => {
    onChange([
      ...value,
      {
        ...emptyTechItem,
        category: group.isUncategorized ? "" : group.name,
      },
    ]);
  };

  const updateItem = <K extends keyof ProjectTechStackItem>(
    index: number,
    field: K,
    nextValue: ProjectTechStackItem[K],
  ) => {
    onChange(
      value.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: nextValue } : item,
      ),
    );
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateGroupName = (group: TechStackGroup, nextName: string) => {
    const nextCategory = toCategoryValue(nextName);

    if (group.isEmptyLocalGroup && group.localGroupId) {
      setEmptyGroups((currentGroups) =>
        currentGroups.map((emptyGroup) =>
          emptyGroup.id === group.localGroupId
            ? { ...emptyGroup, name: nextName }
            : emptyGroup,
        ),
      );
      return;
    }

    onChange(
      value.map((item, index) =>
        group.itemIndexes.includes(index)
          ? { ...item, category: nextCategory }
          : item,
      ),
    );
  };

  const removeGroup = (group: TechStackGroup) => {
    if (group.itemIndexes.length > 0) {
      const confirmed = window.confirm(
        `Remove "${group.name}" and its ${group.itemIndexes.length} tech item${
          group.itemIndexes.length === 1 ? "" : "s"
        }?`,
      );

      if (!confirmed) {
        return;
      }

      const indexesToRemove = new Set(group.itemIndexes);

      onChange(value.filter((_, index) => !indexesToRemove.has(index)));
      return;
    }

    setEmptyGroups((currentGroups) =>
      currentGroups.filter((emptyGroup) => emptyGroup.id !== group.localGroupId),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <label className="text-sm font-medium text-[var(--admin-text)]">Tech stack</label>
          {value.length === 0 ? (
            <p className="mt-1 text-xs text-amber-700">Add at least one item.</p>
          ) : null}
        </div>
        <Button size="sm" onClick={addGroup}>
          <Plus className="size-4" aria-hidden="true" />
          Add group
        </Button>
      </div>
      <p className="text-xs leading-5 text-[var(--admin-muted)]">
        Select the most important tech tags to show on project cards. All tech
        items can still be shown on the project detail page.
      </p>
      {selectedCardTagCount > 6 ? (
        <p className="text-xs leading-5 text-amber-700">
          {selectedCardTagCount} card tags selected. Recommended max is 6.
        </p>
      ) : null}

      {groups.length > 0 ? (
        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group.key}
              className="space-y-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Input
                  value={group.name}
                  placeholder="Category"
                  aria-label={`${group.name} group name`}
                  className="sm:max-w-xs"
                  onChange={(event) => updateGroupName(group, event.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => addItemToGroup(group)}>
                    <Plus className="size-4" aria-hidden="true" />
                    Add tech
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => removeGroup(group)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Remove group
                  </Button>
                </div>
              </div>

              {group.itemIndexes.length > 0 ? (
                <div className="space-y-2">
                  {group.itemIndexes.map((index) => {
                    const item = value[index];

                    return (
                      <div
                        key={`tech-${index}`}
                        className="grid gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 md:grid-cols-[1fr_minmax(14rem,0.85fr)_11rem_auto]"
                      >
                        <Input
                          value={item.label}
                          placeholder="Label"
                          aria-label={`Tech label ${index + 1}`}
                          onChange={(event) =>
                            updateItem(index, "label", event.target.value)
                          }
                        />
                        <div className="grid gap-1.5">
                          <Select
                            value={
                              findTechColorByHex(item.color)?.hex ??
                              defaultTechColor.hex
                            }
                            onValueChange={(hex) =>
                              updateItem(index, "color", hex)
                            }
                          >
                            <SelectTrigger aria-label={`Tech color ${index + 1}`}>
                              <SelectValue placeholder="Color" />
                            </SelectTrigger>
                            <SelectContent>
                              {techColorPalette.map((color) => (
                                <SelectItem key={color.hex} value={color.hex}>
                                  <span className="flex items-center gap-2">
                                    <span
                                      className="size-3 rounded-full border border-[var(--admin-border)]"
                                      style={{ backgroundColor: color.hex }}
                                      aria-hidden="true"
                                    />
                                    <span>{color.name}</span>
                                    <span className="text-[var(--admin-muted)]">
                                      {color.hex}
                                    </span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-2 text-xs text-[var(--admin-muted)]">
                            <span
                              className="size-4 shrink-0 rounded-full border border-[var(--admin-border)]"
                              style={{ backgroundColor: getColorSummary(item.color).hex }}
                              aria-hidden="true"
                            />
                            <span className="font-medium text-[var(--admin-text)]">
                              {getColorSummary(item.color).name}
                            </span>
                            <span>{getColorSummary(item.color).hex}</span>
                          </div>
                        </div>
                        <label className="flex h-10 items-center justify-between gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 text-xs font-medium text-[var(--admin-text)]">
                          <span>Show on project card</span>
                          <Switch
                            checked={item.showOnCard ?? false}
                            onCheckedChange={(checked) =>
                              updateItem(index, "showOnCard", checked)
                            }
                            aria-label={`Show tech item ${index + 1} on project card`}
                          />
                        </label>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-10 px-3"
                          onClick={() => removeItem(index)}
                          aria-label={`Remove tech item ${index + 1}`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-sm text-[var(--admin-muted)]">
                  No tech items in this group yet.
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-4 py-3 text-sm text-[var(--admin-muted)]">
          No tech stack items added yet.
        </div>
      )}
    </div>
  );
}
