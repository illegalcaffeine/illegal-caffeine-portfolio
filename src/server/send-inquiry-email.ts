import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inquiryEmailSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  discord: z.string().trim().max(120).optional(),
  project_type: z.string().trim().min(1).max(120),
  build_scale: z.string().trim().max(120).optional(),
  budget_range: z.string().trim().max(120).optional(),
  deadline: z.string().trim().max(120).optional(),
  description: z.string().trim().min(30).max(5000),
  references: z.string().trim().max(2000).optional(),
  extras: z.string().trim().max(2000).optional(),
});

function clean(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not provided";
}

export const sendInquiryEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inquiryEmailSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[contact] RESEND_API_KEY is not configured");
      throw new Error("Email service is not configured");
    }

    const text = [
      "New project inquiry from the ILLEGAL CAFFEINE portfolio.",
      "",
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Discord: ${clean(data.discord)}`,
      `Project type: ${data.project_type}`,
      `Build scale: ${clean(data.build_scale)}`,
      `Budget: ${clean(data.budget_range)}`,
      `Desired deadline: ${clean(data.deadline)}`,
      "",
      "Project description:",
      data.description,
      "",
      "Style / references:",
      clean(data.references),
      "",
      "Extra requests:",
      clean(data.extras),
      "",
      "Commission terms accepted: yes",
    ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ILLEGAL CAFFEINE Website <onboarding@resend.dev>",
        to: ["illegalcaffeine@gmail.com"],
        reply_to: data.email,
        subject: `New Project Inquiry — ${data.name} — ${data.project_type}`,
        text,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error(`[contact] Resend failed (${response.status}): ${detail}`);
      throw new Error("Email notification failed");
    }

    return { ok: true };
  });
