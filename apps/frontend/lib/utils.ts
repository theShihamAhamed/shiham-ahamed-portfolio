import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export {
  formatProjectDateRange,
  formatProjectMonth as formatMonthYear,
} from "@portfolio/shared";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
