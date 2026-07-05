"use client";

import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

type FeaturedToggleProps = {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function FeaturedToggle({
  checked,
  disabled,
  onCheckedChange,
}: FeaturedToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={checked}
        disabled={disabled}
        aria-label="Toggle featured status"
        onCheckedChange={onCheckedChange}
      />
      <Badge variant={checked ? "cyan" : "neutral"}>
        <Star className="mr-1 size-3" aria-hidden="true" />
        {checked ? "Featured" : "Not featured"}
      </Badge>
    </div>
  );
}
