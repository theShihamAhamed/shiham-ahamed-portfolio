import type { ProjectStatus } from "./project-statuses";

export const PROJECT_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export type ParsedProjectMonth = {
  year: number;
  month: number;
};

export type ProjectTimelineIssue = {
  field: "startDate" | "endDate";
  message: string;
};

export type ProjectTimeline = {
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
};

export const isProjectMonth = (value: unknown): value is string =>
  typeof value === "string" && PROJECT_MONTH_PATTERN.test(value);

export const parseProjectMonth = (
  value: string,
): ParsedProjectMonth | undefined => {
  if (!isProjectMonth(value)) return undefined;

  return {
    year: Number(value.slice(0, 4)),
    month: Number(value.slice(5, 7)),
  };
};

export const getProjectStartYear = (value: string): number | undefined =>
  parseProjectMonth(value)?.year;

export const compareProjectMonths = (first: string, second: string): number => {
  if (!isProjectMonth(first) || !isProjectMonth(second)) {
    throw new RangeError("Project months must use YYYY-MM format");
  }

  return first.localeCompare(second);
};

export const formatProjectMonth = (value: string): string => {
  const parsed = parseProjectMonth(value);

  return parsed ? `${monthLabels[parsed.month - 1]} ${parsed.year}` : value;
};

export const formatProjectDateRange = (
  startDate: string,
  endDate?: string,
  isOngoing = false,
): string => {
  const start = formatProjectMonth(startDate);

  if (!endDate && !isOngoing) return start;
  if (!endDate || isOngoing) return `${start} – Present`;

  return `${start} – ${formatProjectMonth(endDate)}`;
};

export const formatProjectYearRange = (
  startDate: string,
  endDate?: string,
  isOngoing = false,
): string => {
  const startYear = getProjectStartYear(startDate);

  if (startYear === undefined) return startDate;
  if (!endDate && !isOngoing) return String(startYear);
  if (!endDate || isOngoing) return `${startYear}–Present`;

  const endYear = getProjectStartYear(endDate);
  if (endYear === undefined || endYear === startYear) return String(startYear);

  return `${startYear}–${endYear}`;
};

export const getProjectTimelineIssues = ({
  status,
  startDate,
  endDate,
}: ProjectTimeline): ProjectTimelineIssue[] => {
  const issues: ProjectTimelineIssue[] = [];
  const hasValidStartDate = isProjectMonth(startDate);
  const hasEndDate = typeof endDate === "string" && endDate.length > 0;
  const hasValidEndDate = hasEndDate && isProjectMonth(endDate);

  if (!hasValidStartDate) {
    issues.push({
      field: "startDate",
      message: "Start date must use YYYY-MM format.",
    });
  }

  if (hasEndDate && !hasValidEndDate) {
    issues.push({
      field: "endDate",
      message: "End date must use YYYY-MM format.",
    });
  }

  if (status === "completed" && !hasEndDate) {
    issues.push({
      field: "endDate",
      message: "End date is required for completed projects.",
    });
  }

  if (
    hasValidStartDate &&
    hasValidEndDate &&
    compareProjectMonths(endDate, startDate) < 0
  ) {
    issues.push({
      field: "endDate",
      message: "End date cannot be earlier than start date.",
    });
  }

  return issues;
};

export const isValidProjectTimeline = (timeline: ProjectTimeline): boolean =>
  getProjectTimelineIssues(timeline).length === 0;
