"use client";

import { Eye, EyeOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

type VisibilityToggleProps = {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function VisibilityToggle({
  checked,
  disabled,
  onCheckedChange,
}: VisibilityToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={checked}
        disabled={disabled}
        aria-label="Toggle visibility"
        onCheckedChange={onCheckedChange}
      />
      <Badge variant={checked ? "green" : "neutral"}>
        {checked ? (
          <Eye className="mr-1 size-3" aria-hidden="true" />
        ) : (
          <EyeOff className="mr-1 size-3" aria-hidden="true" />
        )}
        {checked ? "Visible" : "Hidden"}
      </Badge>
    </div>
  );
}
