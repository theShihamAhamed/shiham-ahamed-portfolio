import { TECH_TAG_CATEGORIES, type TechTagCategory } from "./technology-categories";
import { TECHNOLOGY_REGISTRY, TECHNOLOGY_REGISTRY_BY_SLUG } from "./technology-registry";
import type { ProjectTechnology } from "./technology-types";

export const normalizeTechnologyTag = (value: string) => value.trim().toLowerCase().replace(/#/g, " sharp ").replace(/\+/g, " plus ").replace(/\.net/g, " dotnet ").replace(/[._/-]+/g, " ").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
const aliases = new Map<string, (typeof TECHNOLOGY_REGISTRY)[number]>();
for (const entry of TECHNOLOGY_REGISTRY) for (const value of [entry.slug, entry.label, ...entry.aliases]) aliases.set(normalizeTechnologyTag(value), entry);
export const findTechnologyBySlug = (slug: string) => TECHNOLOGY_REGISTRY_BY_SLUG[slug.trim().toLowerCase()];
export const findTechnologyByNameOrAlias = (value: string) => aliases.get(normalizeTechnologyTag(value));
export const getTechnologyLabel = (slug: string) => findTechnologyBySlug(slug)?.label;
export const isKnownTechnologySlug = (value: string): value is (typeof TECHNOLOGY_REGISTRY)[number]["slug"] => Boolean(findTechnologyBySlug(value));
export const getTechnologyBadgeStyles = (slug: string, theme: "light" | "dark") => { const entry = findTechnologyBySlug(slug); return entry?.[theme]; };
export const createCustomTechnologySlug = (label: string) => normalizeTechnologyTag(label).replace(/ /g, "-");
export const isTechTagCategory = (value: unknown): value is TechTagCategory => typeof value === "string" && (TECH_TAG_CATEGORIES as readonly string[]).includes(value);
const hexRgb = (hex: string) => { const value = hex.slice(1); return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255); };
export const contrastRatio = (foreground: string, background: string) => { const luminance = (hex: string) => hexRgb(hex).map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0); const a = luminance(foreground); const b = luminance(background); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
export const validateTechnologyRegistry = () => { const errors: string[] = []; const slugs = new Set<string>(); const owners = new Map<string, string>(); for (const entry of TECHNOLOGY_REGISTRY) { if (!entry.label.trim()) errors.push(`${entry.slug}: empty label`); if (slugs.has(entry.slug)) errors.push(`${entry.slug}: duplicate slug`); slugs.add(entry.slug); if (!isTechTagCategory(entry.category)) errors.push(`${entry.slug}: invalid category`); for (const color of [entry.brandColor, entry.color, entry.light.bg, entry.light.text, entry.light.border, entry.dark.bg, entry.dark.text, entry.dark.border]) if (!/^#[0-9a-fA-F]{6}$/.test(color)) errors.push(`${entry.slug}: invalid color ${color}`); if (contrastRatio(entry.light.text, entry.light.bg) < 4.5) errors.push(`${entry.slug}: light contrast below 4.5`); if (contrastRatio(entry.dark.text, entry.dark.bg) < 4.5) errors.push(`${entry.slug}: dark contrast below 4.5`); for (const value of [entry.slug, entry.label, ...entry.aliases]) { const key = normalizeTechnologyTag(value); const owner = owners.get(key); if (owner && owner !== entry.slug) errors.push(`${entry.slug}: normalized alias collision ${value}`); owners.set(key, entry.slug); } } return errors; };
export const searchTechnologies = (query: string, category?: TechTagCategory) => { const q = normalizeTechnologyTag(query); return TECHNOLOGY_REGISTRY.filter((entry) => !category || entry.category === category).map((entry) => ({ entry, rank: !q ? 4 : normalizeTechnologyTag(entry.label) === q ? 0 : normalizeTechnologyTag(entry.slug) === q ? 1 : entry.aliases.some((a) => normalizeTechnologyTag(a) === q) ? 2 : normalizeTechnologyTag(entry.label).startsWith(q) ? 3 : [entry.label, entry.slug, ...entry.aliases].some((v) => normalizeTechnologyTag(v).includes(q)) ? 4 : 99 })).filter((item) => item.rank < 99).sort((a, b) => a.rank - b.rank || a.entry.label.localeCompare(b.entry.label)).map(({ entry }) => entry); };
export const resolveProjectTechnology = (item: ProjectTechnology) => {
  if (item.kind === "known") {
    const known = findTechnologyBySlug(item.slug);
    if (known) return { ...known, kind: "known" as const, showOnCard: item.showOnCard };
  } else {
    return { kind: "custom" as const, slug: item.slug, label: item.label, category: item.category, color: item.color, showOnCard: item.showOnCard, brandColor: item.color, light: { bg: "#f1f5f9" as const, text: "#17232b" as const, border: item.color }, dark: { bg: "#17232b" as const, text: "#f8fafc" as const, border: item.color } };
  }
  return undefined;
};
