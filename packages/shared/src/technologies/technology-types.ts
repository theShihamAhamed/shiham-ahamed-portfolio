import type { TechTagCategory } from "./technology-categories";

export type HexColor = `#${string}`;
export type TechnologyRegistryEntry = {
  label: string; slug: string; aliases: readonly string[]; category: TechTagCategory;
  brandColor: HexColor; color: HexColor;
  light: { bg: HexColor; text: HexColor; border: HexColor };
  dark: { bg: HexColor; text: HexColor; border: HexColor };
};
export type TechnologySlug = (typeof TECHNOLOGY_REGISTRY)[number]["slug"];
export type KnownProjectTechnology = { kind: "known"; slug: TechnologySlug; showOnCard: boolean };
export type CustomProjectTechnology = { kind: "custom"; slug: string; label: string; category: TechTagCategory; color: HexColor; showOnCard: boolean };
export type ProjectTechnology = KnownProjectTechnology | CustomProjectTechnology;
export type ProjectTechnologyGroup = { name: string; items: ProjectTechnology[] };

// This type-only declaration is completed by the registry module at compile time.
import type { TECHNOLOGY_REGISTRY } from "./technology-registry";
