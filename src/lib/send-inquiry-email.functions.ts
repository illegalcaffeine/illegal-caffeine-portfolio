import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  cleanupInquiryUploads as cleanupInquiryUploadsServer,
  deliverInquiryEmail,
  prepareInquiryUploads as prepareInquiryUploadsServer,
} from "./inquiry-email.server";

const imageContentTypeSchema = z.enum(["image/jpeg", "image/png", "image/webp"]);

const referenceFileSchema = z.object({
  filename: z.string().trim().min(1).max(180),
  contentType: imageContentTypeSchema,
  size: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024),
});

const uploadedReferenceSchema = referenceFileSchema.extend({
  storagePath: z.string().trim().min(1).max(500),
});

const prepareUploadsSchema = z
  .object({
    files: z.array(referenceFileSchema).max(5),
    website: z.string().max(0),
    formStartedAt: z.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    const total = data.files.reduce((sum, file) => sum + file.size, 0);
    if (total > 25 * 1024 * 1024) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["files"],
        message: "Reference images are too large",
      });
    }
  });

const inquiryEmailSchema = z
  .object({
    submissionId: z.string().uuid(),
    uploadSessionId: z.string().uuid().optional(),
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
    referenceImages: z.array(uploadedReferenceSchema).max(5).default([]),
    website: z.string().max(0),
    formStartedAt: z.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    const total = data.referenceImages.reduce((sum, file) => sum + file.size, 0);
    if (total > 25 * 1024 * 1024) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["referenceImages"],
        message: "Reference images are too large",
      });
    }
    if (data.referenceImages.length > 0 && !data.uploadSessionId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["uploadSessionId"],
        message: "Upload session is required",
      });
    }
  });

const cleanupUploadsSchema = z.object({
  uploadSessionId: z.string().uuid(),
});

export const prepareInquiryUploads = createServerFn({ method: "POST" })
  .validator(prepareUploadsSchema)
  .handler(async ({ data }) => prepareInquiryUploadsServer(data));

export const sendInquiryEmail = createServerFn({ method: "POST" })
  .validator(inquiryEmailSchema)
  .handler(async ({ data }) => deliverInquiryEmail(data));

export const cleanupInquiryUploads = createServerFn({ method: "POST" })
  .validator(cleanupUploadsSchema)
  .handler(async ({ data }) => cleanupInquiryUploadsServer(data.uploadSessionId));
