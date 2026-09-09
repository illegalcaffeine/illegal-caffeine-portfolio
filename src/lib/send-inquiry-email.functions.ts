import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { deliverInquiryEmail } from "./inquiry-email.server";

const attachmentSchema = z.object({
  filename: z.string().trim().min(1).max(180),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  content: z.string().min(1).max(7_000_000),
  size: z.number().int().positive().max(5 * 1024 * 1024),
});

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
  referenceImages: z.array(attachmentSchema).max(5).default([]),
  website: z.string().max(0),
  formStartedAt: z.number().int().positive(),
}).superRefine((data, ctx) => {
  const total = data.referenceImages.reduce((sum, file) => sum + file.size, 0);
  if (total > 15 * 1024 * 1024) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["referenceImages"], message: "Reference images are too large" });
  }
});

export const sendInquiryEmail = createServerFn({ method: "POST" })
  .validator(inquiryEmailSchema)
  .handler(async ({ data }) => deliverInquiryEmail(data));
