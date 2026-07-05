import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string in YYYY-MM format to "Mon YYYY" (e.g., "Jan 2026")
 */
export function formatMonthYear(dateStr: string): string {
  try {
    const [year, month] = dateStr.split("-");
    if (!year || !month) return dateStr;

    const date = new Date(`${year}-${month}-01`);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Format project date range (startDate, endDate, status)
 * Returns: "Jan 2025 – Apr 2025" or "Jan 2026 – Present"
 */
export function formatProjectDateRange(
  startDate?: string,
  endDate?: string,
  isOngoing?: boolean,
): string {
  if (!startDate) return "";

  const start = formatMonthYear(startDate);

  if (!endDate && !isOngoing) {
    // No end date and not explicitly ongoing - just show start
    return start;
  }

  if (!endDate || isOngoing) {
    // Ongoing project
    return `${start} – Present`;
  }

  // Completed project
  const end = formatMonthYear(endDate);
  return `${start} – ${end}`;
}
