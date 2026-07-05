import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ErrorStateProps = {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  description = "The request could not be completed.",
  retryLabel = "Retry",
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="border-red-200 bg-red-50 shadow-none">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-red-100 text-red-700 ring-1 ring-inset ring-red-200">
            <TriangleAlert className="size-5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      {onRetry ? (
        <CardContent>
          <Button variant="secondary" onClick={onRetry}>
            {retryLabel}
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
