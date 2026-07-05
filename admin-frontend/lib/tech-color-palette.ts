export type TechColor = {
  name: string;
  hex: string;
};

export const defaultTechColor: TechColor = { name: "Slate", hex: "#475569" };

export const techColorPalette = [
  defaultTechColor,
  { name: "Graphite", hex: "#111827" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Cyan", hex: "#0891b2" },
  { name: "Teal", hex: "#0f766e" },
  { name: "Green", hex: "#16a34a" },
  { name: "Amber", hex: "#d97706" },
  { name: "Rose", hex: "#e11d48" },
  { name: "Violet", hex: "#7c3aed" },
  { name: "Fuchsia", hex: "#c026d3" },
] satisfies TechColor[];

export const findTechColorByHex = (hex?: string) => {
  if (!hex) {
    return undefined;
  }

  return techColorPalette.find(
    (color) => color.hex.toLowerCase() === hex.toLowerCase(),
  );
};
