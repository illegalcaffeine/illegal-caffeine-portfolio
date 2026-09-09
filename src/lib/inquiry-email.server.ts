import { getRequestHeader } from "@tanstack/react-start/server";

export type InquiryAttachment = {
  filename: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  content: string;
  size: number;
};

export type InquiryEmailPayload = {
  name: string;
  email: string;
  discord?: string;
  project_type: string;
  build_scale?: string;
  budget_range?: string;
  deadline?: string;
  description: string;
  references?: string;
  extras?: string;
  referenceImages: InquiryAttachment[];
  website: string;
  formStartedAt: number;
};

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const requestLog = new Map<string, number[]>();

function clean(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not provided";
}

function hasValidImageSignature(file: InquiryAttachment) {
  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(Buffer.from(file.content, "base64"));
  } catch {
    return false;
  }
  if (bytes.byteLength !== file.size) return false;
  if (file.contentType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.contentType === "image/png") return bytes.slice(0, 8).every((value, index) => value === [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a][index]);
  if (file.contentType === "image/webp") return Buffer.from(bytes.slice(0, 4)).toString("ascii") === "RIFF" && Buffer.from(bytes.slice(8, 12)).toString("ascii") === "WEBP";
  return false;
}

function clientKey() {
  return (
    getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
    getRequestHeader("x-real-ip") ||
    "unknown"
  );
}

function enforceAbuseProtection(data: InquiryEmailPayload) {
  if (data.website) throw new Error("Invalid submission");

  if (data.referenceImages.some((file) => !hasValidImageSignature(file))) throw new Error("Invalid reference image");

  const age = Date.now() - data.formStartedAt;
  if (age < 2000 || age > 24 * 60 * 60 * 1000) throw new Error("Invalid submission timing");

  const key = clientKey();
  const now = Date.now();
  const recent = (requestLog.get(key) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) throw new Error("Too many inquiries. Please try again later.");
  recent.push(now);
  requestLog.set(key, recent);

  if (requestLog.size > 1000) {
    for (const [entryKey, times] of requestLog) {
      if (!times.some((time) => now - time < WINDOW_MS)) requestLog.delete(entryKey);
    }
  }
}

export async function deliverInquiryEmail(data: InquiryEmailPayload) {
  enforceAbuseProtection(data);

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
    `Reference images: ${data.referenceImages.length ? data.referenceImages.map((file) => file.filename).join(", ") : "None"}`,
    "",
    "Project description:",
    data.description,
    "",
    "Style / reference links:",
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
      attachments: data.referenceImages.map((file) => ({
        filename: file.filename,
        content: file.content,
      })),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error(`[contact] Resend failed (${response.status}): ${detail}`);
    throw new Error("Email notification failed");
  }

  return { ok: true };
}
