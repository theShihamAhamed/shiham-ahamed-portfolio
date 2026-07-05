import { cn } from "@/lib/utils";
import { ProjectTag } from "@/types/project";

const fallbackTagColor = "#5C7E8F";

export const isValidHexColor = (value: string): boolean =>
  /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());

export const hexToRgba = (hex: string, alpha: number): string => {
  const normalized = hex.trim();
  const raw = normalized.slice(1);
  const fullHex =
    raw.length === 3
      ? raw
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : raw;

  const red = Number.parseInt(fullHex.slice(0, 2), 16);
  const green = Number.parseInt(fullHex.slice(2, 4), 16);
  const blue = Number.parseInt(fullHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export const getReadableTagStyles = (color?: string) => {
  const normalizedColor = color?.trim();
  const tagColor =
    normalizedColor && isValidHexColor(normalizedColor)
      ? normalizedColor
      : fallbackTagColor;

  return {
    borderColor: hexToRgba(tagColor, 0.35),
    backgroundColor: hexToRgba(tagColor, 0.12),
    color: tagColor,
  };
};

type Props = {
  tag: ProjectTag;
  className?: string;
};

const TechTag = ({ tag, className }: Props) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-[-0.01em] backdrop-blur-sm transition-colors duration-300",
        className,
      )}
      style={getReadableTagStyles(tag.color)}
    >
      {tag.label}
    </span>
  );
};

export default TechTag;
