"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { LiquidGlassButton } from "./liquid-glass";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type FieldErrors = Partial<Record<"name" | "email" | "message" | "form", string>>;
export function ContactForm({ email, note }: { email: string; note: string }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const { contactSchema } = await import("@/lib/contact-schema");
    const parsed = contactSchema.pick({ name: true, email: true, message: true }).safeParse({
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
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
    if (!email) {
      setErrors({ form: "The contact email is unavailable. Please try again later." });
      return;
    }
    setErrors({});
    const query = new URLSearchParams({
      view: "cm",
      fs: "1",
      to: email,
      su: `Portfolio enquiry from ${parsed.data.name}`,
      body: `${parsed.data.message}\n\nFrom: ${parsed.data.name}\nReply email: ${parsed.data.email}`,
    });
    window.location.assign(`https://mail.google.com/mail/?${query.toString()}`);
  }
  return (
    <form
      className="contact-form"
      onSubmit={submit}
      noValidate
      aria-label="Contact form"
    >
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
      {errors.form && (
        <p className="field-error" role="alert">
          {errors.form}
        </p>
      )}
      {email && (
        <a className="text-link contact-email-fallback" href={`mailto:${email}`}>
          Use another email app <ArrowUpRight size={16} />
        </a>
      )}
      <LiquidGlassButton type="submit">
            Send message
            <ArrowUpRight size={18} />
      </LiquidGlassButton>
      <p className="form-note">Opens a draft in Gmail. Review it and press Send there.</p>
    </form>
  );
}
