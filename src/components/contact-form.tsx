"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((module) => module.Toaster),
  { ssr: false },
);

type FieldErrors = Partial<Record<"name" | "email" | "message" | "form", string>>;
export function ContactForm({ email, note }: { email: string; note: string }) {
  const loadedAt = useRef(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(false);
  useEffect(() => {
    loadedAt.current = Date.now();
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setFeedback(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const { contactSchema } = await import("@/lib/contact-schema");
    const parsed = contactSchema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
      website: data.get("website") || "",
      loadedAt: loadedAt.current,
    });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      form.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }
    if (Date.now() - loadedAt.current < 3000) {
      setErrors({ form: "Please wait a moment, then send your message again." });
      return;
    }
    setErrors({});
    setSending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) throw new Error("Unable to send");
      const result = (await response.json()) as { development?: boolean };
      const { toast } = await import("sonner");
      toast.success(
        result.development
          ? "Preview recorded locally. No email was sent."
          : "Message sent. I will reply by email.",
      );
      form.reset();
    } catch {
      const message = email
        ? `Could not send. Please email ${email}.`
        : "Could not send. Please try again later.";
      setErrors({ form: message });
      const { toast } = await import("sonner");
      toast.error(message);
    } finally {
      setSending(false);
    }
  }
  return (
    <form
      className="contact-form"
      onSubmit={submit}
      onFocusCapture={() => setFeedback(true)}
      noValidate
      aria-label="Contact form"
    >
      {feedback && <Toaster theme="light" position="top-center" richColors closeButton />}
      {note && <p className="form-note">{note}</p>}
      <div className="form-row">
        {(
          [
            {
              name: "name",
              label: "Name",
              placeholder: "Your name",
              type: "text",
              autocomplete: "name",
            },
            {
              name: "email",
              label: "Email",
              placeholder: "you@example.com",
              type: "email",
              autocomplete: "email",
            },
          ] as const
        ).map((field) => (
          <div className="field" key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              autoComplete={field.autocomplete}
              maxLength={field.name === "name" ? 80 : 254}
              required
              aria-invalid={!!errors[field.name]}
              aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
            />
            {errors[field.name] && (
              <p className="field-error" id={`${field.name}-error`}>
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="field">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="A little about your idea…"
          rows={5}
          maxLength={5000}
          required
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && (
          <p className="field-error" id="message-error">
            {errors.message}
          </p>
        )}
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {errors.form && (
        <p className="field-error" role="alert">
          {errors.form}
        </p>
      )}
      {errors.form && email && (
        <a className="text-link contact-email-fallback" href={`mailto:${email}`}>
          Send an email instead <ArrowUpRight size={16} />
        </a>
      )}
      <Button className="send-button" type="submit" disabled={sending}>
        {sending ? (
          <>
            Sending
            <LoaderCircle size={18} className="sending-icon" />
          </>
        ) : (
          <>
            Send message
            <ArrowUpRight size={18} />
          </>
        )}
      </Button>
      {process.env.NODE_ENV === "development" && (
        <p className="development-note">
          Preview form · messages are logged locally until email is configured.
        </p>
      )}
    </form>
  );
}
