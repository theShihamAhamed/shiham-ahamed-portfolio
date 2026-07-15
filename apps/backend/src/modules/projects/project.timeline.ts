import {
  getProjectTimelineIssues,
  type ProjectStatus,
} from "@portfolio/shared";

import { AppError } from "../../utils/app-error";

export type ProjectTimelineState = {
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
};

export const assertValidProjectTimeline = (
  timeline: ProjectTimelineState,
): void => {
  const issues = getProjectTimelineIssues(timeline);

  if (issues.length === 0) return;

  throw new AppError(
    "Validation failed",
    422,
    "VALIDATION_ERROR",
    issues.map((issue) => ({
      path: issue.field,
      message: issue.message,
      code: "custom",
    })),
  );
};
