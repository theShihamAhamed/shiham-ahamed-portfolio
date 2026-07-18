import { z } from "zod";

export const PROJECT_CONTENT_LIMITS = {
  shortDescription: {
    maxCharacters: 220,
    recommendedMinCharacters: 120,
    recommendedMaxCharacters: 180,
  },
  overview: {
    minItems: 1,
    maxItems: 3,
    recommendedMinItems: 2,
    recommendedMaxItems: 3,
    maxCharactersPerItem: 650,
  },
  highlights: {
    minItems: 1,
    maxItems: 7,
    recommendedItems: 5,
    maxCharactersPerItem: 220,
  },
  architectureSummary: {
    maxCharacters: 450,
    recommendedMinSentences: 2,
    recommendedMaxSentences: 3,
  },
  architecturePoints: {
    minItems: 0,
    maxItems: 5,
    recommendedMinItems: 3,
    recommendedMaxItems: 5,
    maxCharactersPerItem: 180,
  },
} as const;

export const projectShortDescriptionSchema = z
  .string()
  .trim()
  .min(1, "Card description is required.")
  .max(
    PROJECT_CONTENT_LIMITS.shortDescription.maxCharacters,
    `Card description must be ${PROJECT_CONTENT_LIMITS.shortDescription.maxCharacters} characters or fewer.`,
  );

const overviewParagraphSchema = z
  .string()
  .trim()
  .min(1, "Overview paragraph cannot be empty.")
  .max(
    PROJECT_CONTENT_LIMITS.overview.maxCharactersPerItem,
    `Overview paragraph must be ${PROJECT_CONTENT_LIMITS.overview.maxCharactersPerItem} characters or fewer.`,
  );

export const projectOverviewSchema = z
  .array(overviewParagraphSchema)
  .min(
    PROJECT_CONTENT_LIMITS.overview.minItems,
    "Add at least 1 overview paragraph.",
  )
  .max(
    PROJECT_CONTENT_LIMITS.overview.maxItems,
    `Overview can contain at most ${PROJECT_CONTENT_LIMITS.overview.maxItems} paragraphs.`,
  );

const highlightSchema = z
  .string()
  .trim()
  .min(1, "Highlight cannot be empty.")
  .max(
    PROJECT_CONTENT_LIMITS.highlights.maxCharactersPerItem,
    `Highlight must be ${PROJECT_CONTENT_LIMITS.highlights.maxCharactersPerItem} characters or fewer.`,
  );

export const projectHighlightsSchema = z
  .array(highlightSchema)
  .min(
    PROJECT_CONTENT_LIMITS.highlights.minItems,
    "Add at least 1 highlight.",
  )
  .max(
    PROJECT_CONTENT_LIMITS.highlights.maxItems,
    `Highlights can contain at most ${PROJECT_CONTENT_LIMITS.highlights.maxItems} items.`,
  );

export const projectArchitectureSummaryTextSchema = z
  .string()
  .trim()
  .max(
    PROJECT_CONTENT_LIMITS.architectureSummary.maxCharacters,
    `Architecture summary must be ${PROJECT_CONTENT_LIMITS.architectureSummary.maxCharacters} characters or fewer.`,
  );

const architecturePointSchema = z
  .string()
  .trim()
  .min(1, "Architecture point cannot be empty.")
  .max(
    PROJECT_CONTENT_LIMITS.architecturePoints.maxCharactersPerItem,
    `Architecture point must be ${PROJECT_CONTENT_LIMITS.architecturePoints.maxCharactersPerItem} characters or fewer.`,
  );

export const projectArchitecturePointsSchema = z
  .array(architecturePointSchema)
  .max(
    PROJECT_CONTENT_LIMITS.architecturePoints.maxItems,
    `Architecture can contain at most ${PROJECT_CONTENT_LIMITS.architecturePoints.maxItems} points.`,
  );
