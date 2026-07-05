"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";

import { motionTokens } from "@/components/motion/motion-tokens";
import { Button } from "@/components/ui/button";

type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

type FieldErrors = Partial<Record<keyof ContactFormValues, string[]>>;

type ContactApiResponse =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        fieldErrors?: FieldErrors;
      };
    };

type FormStatus =
  | {
      type: "idle";
      message: "";
    }
  | {
      type: "success" | "error";
      message: string;
    };

const initialValues: ContactFormValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

const inputClassName =
  "h-12 w-full rounded-xl border border-border/60 bg-background/70 px-4 text-sm text-foreground shadow-sm outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground/65 focus:border-foreground/35 focus:bg-background focus-visible:ring-2 focus-visible:ring-ring/45 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive/60 aria-invalid:focus-visible:ring-destructive/25";

const textareaClassName =
  "min-h-44 w-full resize-y rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm leading-6 text-foreground shadow-sm outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground/65 focus:border-foreground/35 focus:bg-background focus-visible:ring-2 focus-visible:ring-ring/45 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive/60 aria-invalid:focus-visible:ring-destructive/25";

export default function ContactForm() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<FormStatus>({
    type: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateValue = (field: keyof ContactFormValues, value: string) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    if (status.type !== "idle") {
      setStatus({
        type: "idle",
        message: "",
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setStatus({
      type: "idle",
      message: "",
    });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as ContactApiResponse;

      if (!response.ok || !payload.success) {
        const message =
          payload.success === false
            ? payload.error.message
            : "The message could not be sent. Please try again.";

        setFieldErrors(
          payload.success === false ? payload.error.fieldErrors ?? {} : {},
        );
        setStatus({
          type: "error",
          message,
        });
        return;
      }

      setValues(initialValues);
      setStatus({
        type: "success",
        message: payload.message,
      });
    } catch {
      setStatus({
        type: "error",
        message:
          "The message could not be sent right now. Please try again or use the direct email link.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nameError = fieldErrors.name?.[0];
  const emailError = fieldErrors.email?.[0];
  const subjectError = fieldErrors.subject?.[0];
  const messageError = fieldErrors.message?.[0];

  return (
    <form className="mt-7 space-y-5 sm:mt-8 sm:space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => updateValue("website", event.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={120}
            value={values.name}
            onChange={(event) => updateValue("name", event.target.value)}
            placeholder="Your name"
            disabled={isSubmitting}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? "name-error" : undefined}
            className={inputClassName}
          />
          {nameError ? (
            <p id="name-error" className="mt-2 text-sm text-destructive">
              {nameError}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={values.email}
            onChange={(event) => updateValue("email", event.target.value)}
            placeholder="you@example.com"
            disabled={isSubmitting}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "email-error" : undefined}
            className={inputClassName}
          />
          {emailError ? (
            <p id="email-error" className="mt-2 text-sm text-destructive">
              {emailError}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label
          htmlFor="subject"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          maxLength={160}
          value={values.subject}
          onChange={(event) => updateValue("subject", event.target.value)}
          placeholder="What would you like to discuss?"
          disabled={isSubmitting}
          aria-invalid={Boolean(subjectError)}
          aria-describedby={subjectError ? "subject-error" : undefined}
          className={inputClassName}
        />
        {subjectError ? (
          <p id="subject-error" className="mt-2 text-sm text-destructive">
            {subjectError}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={7}
          value={values.message}
          onChange={(event) => updateValue("message", event.target.value)}
          placeholder="Share a few details about the role, project, or collaboration."
          disabled={isSubmitting}
          aria-invalid={Boolean(messageError)}
          aria-describedby={messageError ? "message-error" : undefined}
          className={textareaClassName}
        />
        {messageError ? (
          <p id="message-error" className="mt-2 text-sm text-destructive">
            {messageError}
          </p>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {status.type !== "idle" ? (
          <motion.div
            key={status.type}
            initial={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }
            }
            transition={{
              duration: shouldReduceMotion ? 0.01 : motionTokens.duration.fast,
              ease: motionTokens.ease,
            }}
            role={status.type === "error" ? "alert" : "status"}
            aria-live={status.type === "error" ? "assertive" : "polite"}
            className={
              status.type === "error"
                ? "flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive shadow-sm"
                : "flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-700 shadow-sm dark:text-emerald-300"
            }
          >
            {status.type === "error" ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{status.message}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="pt-1">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl bg-foreground px-6 text-sm text-background shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md disabled:hover:translate-y-0 disabled:hover:shadow-sm sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send message
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
