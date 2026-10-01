import { Resend } from "resend";
import { contactSchema } from "@/lib/contact-schema";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    return Response.json({ error: "JSON required" }, { status: 415 });
  if (Number(request.headers.get("content-length") || 0) > 16384)
    return Response.json({ error: "Message too large" }, { status: 413 });
  let body: unknown;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > 16384)
      return Response.json({ error: "Message too large" }, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (
    typeof body === "object" &&
    body !== null &&
    "website" in body &&
    typeof body.website === "string" &&
    body.website.trim()
  )
    return Response.json({ ok: true });
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success)
    return Response.json(
      { error: "Please check your name, email, and message." },
      { status: 400 },
    );
  const data = parsed.data;
  if (Date.now() - data.loadedAt < 3000 || Date.now() - data.loadedAt > 86400000)
    return Response.json(
      { error: "Please refresh the page and try again after a moment." },
      { status: 400 },
    );
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM) {
    if (process.env.NODE_ENV !== "development")
      return Response.json({ error: "Email is not configured." }, { status: 503 });
    console.info("[contact:development-only]", {
      name: data.name,
      email: data.email,
      message: data.message,
    });
    return Response.json({ ok: true, development: true });
  }
  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: CONTACT_FROM,
      to: CONTACT_TO_EMAIL,
      replyTo: data.email,
      subject: "New portfolio message",
      text: `From: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
    });
    if (error)
      return Response.json({ error: "Message could not be delivered." }, { status: 502 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Message could not be delivered." }, { status: 502 });
  }
}
