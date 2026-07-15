import { z } from "zod";
import { TECH_TAG_CATEGORIES } from "./technology-categories";
import { findTechnologyByNameOrAlias, isKnownTechnologySlug, isTechTagCategory, createCustomTechnologySlug, normalizeTechnologyTag } from "./technology-utils";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex color.");
export const knownProjectTechnologySchema = z.object({ kind: z.literal("known"), slug: z.string().refine(isKnownTechnologySlug, "Choose a technology from the registry."), showOnCard: z.boolean() }).strict();
export const customProjectTechnologySchema = z.object({ kind: z.literal("custom"), slug: z.string().trim().min(1), label: z.string().trim().min(1, "Custom label is required."), category: z.enum(TECH_TAG_CATEGORIES), color: hex, showOnCard: z.boolean() }).strict().superRefine((value, context) => {
  if (findTechnologyByNameOrAlias(value.label)) context.addIssue({ code: "custom", path: ["label"], message: "This label belongs to a known technology." });
  if (isKnownTechnologySlug(value.slug) || findTechnologyByNameOrAlias(value.slug)) context.addIssue({ code: "custom", path: ["slug"], message: "Custom slug conflicts with a known technology." });
  if (normalizeTechnologyTag(value.slug) !== normalizeTechnologyTag(createCustomTechnologySlug(value.label))) context.addIssue({ code: "custom", path: ["slug"], message: "Custom slug must be generated from the label." });
});
export const projectTechnologySchema = z.discriminatedUnion("kind", [knownProjectTechnologySchema, customProjectTechnologySchema]);
export const projectTechnologyGroupSchema = z.object({ name: z.string().trim().min(1, "Technology group name is required."), items: z.array(projectTechnologySchema).min(1, "Technology group cannot be empty.") }).strict();
export const projectTechnologyListSchema = z.array(projectTechnologySchema).min(1).superRefine((items, context) => { const seen = new Set<string>(); items.forEach((item, index) => { const key = item.kind === "known" ? `known:${item.slug}` : `custom:${normalizeTechnologyTag(item.slug)}`; if (seen.has(key)) context.addIssue({ code: "custom", path: [index], message: "Technology is already selected." }); seen.add(key); }); });
