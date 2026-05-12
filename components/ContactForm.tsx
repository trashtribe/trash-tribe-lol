"use client";

import { useCallback, useState } from "react";

const inputClass =
  "min-h-[44px] w-full border tt-border-light bg-background px-4 text-[13px] tt-text-on-light placeholder:text-[color:color-mix(in_srgb,var(--tt-text-on-light)_45%,transparent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--tt-accent-secondary)]";

const labelClass = "text-[11px] font-bold tracking-[0.16em] tt-text-on-light uppercase";

type FieldErrors = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

function validateEmail(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Enter a valid email address.";
  return undefined;
}

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setErrors({});
    setSubmitted(false);
    setSubmitError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Name is required.";
    const emailErr = validateEmail(email);
    if (emailErr) next.email = emailErr;
    if (!subject) next.subject = "Please choose a subject.";
    if (!message.trim()) next.message = "Message is required.";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      setSubmitted(false);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject,
          message: message.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setSubmitError(
          typeof data.error === "string"
            ? data.error
            : "Something went wrong. Please try again.",
        );
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="border tt-border-light bg-background p-8 sm:p-10"
        role="status"
        aria-live="polite"
      >
        <p className="text-lg font-bold tracking-[0.12em] tt-text-on-light uppercase sm:text-xl">
          Message sent
        </p>
        <p className="mt-3 max-w-md text-[13px] leading-relaxed tracking-[0.04em] tt-text-on-light">
          Thanks for reaching out. We&apos;ll get back to you soon.
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="mt-8 w-full min-h-[48px] tt-bg-dark text-[11px] font-bold tracking-[0.2em] tt-text-primary uppercase transition-opacity hover:opacity-90"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-name" className={labelClass}>
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
        />
        {errors.name ? (
          <p id="contact-name-error" className="text-[12px] tt-text-secondary">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-email" className={labelClass}>
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
        />
        {errors.email ? (
          <p id="contact-email-error" className="text-[12px] tt-text-secondary">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-subject" className={labelClass}>
          Subject
        </label>
        <select
          id="contact-subject"
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={`${inputClass} appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          }}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
        >
          <option value="">Select…</option>
          <option value="order">Order</option>
          <option value="collab">Collab</option>
          <option value="general">General</option>
        </select>
        {errors.subject ? (
          <p id="contact-subject-error" className="text-[12px] tt-text-secondary">
            {errors.subject}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} min-h-[140px] resize-y py-3`}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
        />
        {errors.message ? (
          <p id="contact-message-error" className="text-[12px] tt-text-secondary">
            {errors.message}
          </p>
        ) : null}
      </div>

      {submitError ? (
        <p className="text-[12px] text-red-600" role="alert">
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full min-h-[52px] tt-bg-dark text-[11px] font-bold tracking-[0.22em] tt-text-primary uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
