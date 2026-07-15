export type SectionPosition = {
  id: string;
  top: number;
};

export const SECTION_SCROLL_OFFSET = 80;

export const getSectionScrollOffset = (cssValue?: string | null) => {
  const parsed = Number.parseFloat(cssValue ?? "");
  return Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : SECTION_SCROLL_OFFSET;
};

export const getActiveSectionId = (
  sections: readonly SectionPosition[],
  activationLine: number,
  scrollY: number,
  viewportHeight: number,
  documentHeight: number,
) => {
  if (sections.length === 0) return "";

  const lastPassed = sections.findLast(
    (section) => section.top <= activationLine,
  );

  if (scrollY + viewportHeight >= documentHeight - 2) {
    return sections[sections.length - 1].id;
  }

  return lastPassed?.id ?? sections[0].id;
};

export const getDuplicateSectionIds = (ids: readonly string[]) => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  ids.forEach((id) => {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  });

  return [...duplicates];
};
