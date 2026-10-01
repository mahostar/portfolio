import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name (at least 2 characters).").max(80, "Please keep your name under 80 characters."),
  email: z.email("Please enter a valid email address.").max(254),
  message: z.string().trim().min(20, "Please write at least 20 characters.").max(5000, "Please keep your message under 5,000 characters."),
  website: z.string().max(500).default(""),
  loadedAt: z.number().finite().positive(),
});
export type ContactPayload = z.infer<typeof contactSchema>;
