import { AlertCircle } from "lucide-react";

type FieldErrorProps = {
  message?: string;
  id?: string;
};

export function FieldError({ message, id }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-red-700"
    >
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
