import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { deliverInquiryEmail } from "./inquiry-email.server";

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

export const sendInquiryEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inquiryEmailSchema.parse(data))
  .handler(async ({ data }) => deliverInquiryEmail(data));
