import { createClient } from "@supabase/supabase-js";
import { getRequestHeader } from "@tanstack/react-start/server";

const REFERENCE_BUCKET = "inquiry-references";
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"] as const);
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 25 * 1024 * 1024;
const MAX_REFERENCE_FILES = 5;
const DOWNLOAD_URL_TTL_SECONDS = 10 * 60;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

export type InquiryReferenceFile = {
  filename: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  size: number;
  storagePath: string;
};

export type InquiryEmailPayload = {
  submissionId: string;
  uploadSessionId?: string | undefined;
  name: string;
  email: string;
  discord?: string | undefined;
  project_type: string;
  build_scale?: string | undefined;
  budget_range?: string | undefined;
  deadline?: string | undefined;
  description: string;
  references?: string | undefined;
  extras?: string | undefined;
  referenceImages: InquiryReferenceFile[];
  website: string;
  formStartedAt: number;
};

export type PrepareUploadsPayload = {
  files: Array<{
    filename: string;
    contentType: "image/jpeg" | "image/png" | "image/webp";
    size: number;
  }>;
  website: string;
  formStartedAt: number;
};

const requestLog = new Map<string, number[]>();
const uploadRequestLog = new Map<string, number[]>();

function clean(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not provided";
}

function clientKey() {
  return (
    getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
    getRequestHeader("x-real-ip") ||
    "unknown"
  );
}

function enforceTimingAndHoneypot(website: string, formStartedAt: number) {
  if (website) throw new Error("Invalid submission");
  const age = Date.now() - formStartedAt;
  if (age < 2000 || age > 24 * 60 * 60 * 1000) {
    throw new Error("Invalid submission timing");
  }
}

function enforceMemoryRateLimit(log: Map<string, number[]>, limit: number) {
  const key = clientKey();
  const now = Date.now();
  const recent = (log.get(key) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= limit) {
    throw new Error("Too many inquiries. Please try again later.");
  }
  recent.push(now);
  log.set(key, recent);

  if (log.size > 1000) {
    for (const [entryKey, times] of log) {
      if (!times.some((time) => now - time < WINDOW_MS)) log.delete(entryKey);
    }
  }
}

function getServerSupabase() {
  const url = process.env["SUPABASE_URL"] || import.meta.env["VITE_SUPABASE_URL"];
  const secretKey = process.env["SUPABASE_SECRET_KEY"] || process.env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!url) throw new Error("SUPABASE_URL is not configured");
  if (!secretKey) throw new Error("SUPABASE_SECRET_KEY is not configured");

  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function extensionFor(contentType: InquiryReferenceFile["contentType"]) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  return "webp";
}

function assertReferenceLimits(files: Array<{ contentType: string; size: number }>) {
  if (files.length > MAX_REFERENCE_FILES) throw new Error("Too many reference images");
  if (
    files.some(
      (file) => !ALLOWED_MIME_TYPES.has(file.contentType as InquiryReferenceFile["contentType"]),
    )
  ) {
    throw new Error("Invalid reference image type");
  }
  if (files.some((file) => file.size <= 0 || file.size > MAX_FILE_SIZE)) {
    throw new Error("Reference image is too large");
  }
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > MAX_TOTAL_SIZE) throw new Error("Reference images are too large");
}

function assertStoragePath(uploadSessionId: string, storagePath: string) {
  const prefix = `inquiries/${uploadSessionId}/`;
  if (!storagePath.startsWith(prefix)) throw new Error("Invalid reference image path");
  const basename = storagePath.slice(prefix.length);
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(basename)) {
    throw new Error("Invalid reference image path");
  }
}

async function verifyStoredReferences(uploadSessionId: string, files: InquiryReferenceFile[]) {
  assertReferenceLimits(files);
  for (const file of files) assertStoragePath(uploadSessionId, file.storagePath);

  const supabase = getServerSupabase();
  const prefix = `inquiries/${uploadSessionId}`;
  const { data, error } = await supabase.storage
    .from(REFERENCE_BUCKET)
    .list(prefix, { limit: 100 });
  if (error) throw new Error(`Unable to verify reference images: ${error.message}`);

  const stored = new Map((data || []).filter((item) => item.id).map((item) => [item.name, item]));

  for (const file of files) {
    const basename = file.storagePath.slice(prefix.length + 1);
    const object = stored.get(basename);
    if (!object?.metadata) throw new Error("Reference image upload is missing");

    const storedSize = Number(object.metadata.size);
    const storedMime = String(object.metadata.mimetype || object.metadata["contentType"] || "");
    if (storedSize !== file.size) throw new Error("Reference image size mismatch");
    if (storedMime && storedMime !== file.contentType)
      throw new Error("Reference image type mismatch");
  }
}

async function enforceDatabaseRateLimit(email: string) {
  const supabase = getServerSupabase();
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count, error } = await supabase
    .from("commission_inquiries")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", since);

  if (error) throw new Error(`Unable to verify inquiry record: ${error.message}`);
  if (!count) throw new Error("Inquiry record not found");
  if (count > MAX_REQUESTS_PER_WINDOW) {
    throw new Error("Too many inquiries. Please try again later.");
  }
}

export async function prepareInquiryUploads(data: PrepareUploadsPayload) {
  enforceTimingAndHoneypot(data.website, data.formStartedAt);
  enforceMemoryRateLimit(uploadRequestLog, 10);
  assertReferenceLimits(data.files);

  const supabase = getServerSupabase();
  const uploadSessionId = crypto.randomUUID();
  const files = [] as Array<{
    filename: string;
    contentType: InquiryReferenceFile["contentType"];
    size: number;
    storagePath: string;
    token: string;
  }>;

  for (const file of data.files) {
    const storagePath = `inquiries/${uploadSessionId}/${crypto.randomUUID()}.${extensionFor(file.contentType)}`;
    const { data: signed, error } = await supabase.storage
      .from(REFERENCE_BUCKET)
      .createSignedUploadUrl(storagePath, { upsert: false });

    if (error || !signed?.token) {
      await cleanupInquiryUploads(uploadSessionId).catch(() => undefined);
      throw new Error(
        `Unable to prepare reference image upload: ${error?.message || "unknown error"}`,
      );
    }

    files.push({ ...file, storagePath, token: signed.token });
  }

  return { bucket: REFERENCE_BUCKET, uploadSessionId, files };
}

export async function cleanupInquiryUploads(uploadSessionId: string) {
  const supabase = getServerSupabase();
  const prefix = `inquiries/${uploadSessionId}`;
  const { data, error } = await supabase.storage
    .from(REFERENCE_BUCKET)
    .list(prefix, { limit: 100 });
  if (error) throw new Error(`Unable to list reference images for cleanup: ${error.message}`);

  const paths = (data || []).filter((item) => item.id).map((item) => `${prefix}/${item.name}`);

  if (!paths.length) return { ok: true, removed: 0 };
  const { error: removeError } = await supabase.storage.from(REFERENCE_BUCKET).remove(paths);
  if (removeError) throw new Error(`Unable to clean up reference images: ${removeError.message}`);
  return { ok: true, removed: paths.length };
}

export async function deliverInquiryEmail(data: InquiryEmailPayload) {
  enforceTimingAndHoneypot(data.website, data.formStartedAt);
  enforceMemoryRateLimit(requestLog, MAX_REQUESTS_PER_WINDOW);
  await enforceDatabaseRateLimit(data.email);

  if (data.referenceImages.length) {
    if (!data.uploadSessionId) throw new Error("Upload session is required");
    await verifyStoredReferences(data.uploadSessionId, data.referenceImages);
  }

  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not configured");
    throw new Error("Email service is not configured");
  }

  const supabase = getServerSupabase();
  const signedReferences: Array<InquiryReferenceFile & { signedUrl: string }> = [];

  for (const file of data.referenceImages) {
    const { data: signed, error } = await supabase.storage
      .from(REFERENCE_BUCKET)
      .createSignedUrl(file.storagePath, DOWNLOAD_URL_TTL_SECONDS);
    if (error || !signed?.signedUrl) {
      throw new Error(`Unable to create attachment URL: ${error?.message || "unknown error"}`);
    }
    signedReferences.push({ ...file, signedUrl: signed.signedUrl });
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
    `Reference images: ${signedReferences.length ? signedReferences.map((file) => file.filename).join(", ") : "None"}`,
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
      "Idempotency-Key": `inquiry/${data.submissionId}`,
    },
    body: JSON.stringify({
      from: "ILLEGAL CAFFEINE Website <onboarding@resend.dev>",
      to: ["illegalcaffeine@gmail.com"],
      reply_to: data.email,
      subject: `New Project Inquiry — ${data.name} — ${data.project_type}`,
      text,
      attachments: signedReferences.map((file) => ({
        filename: file.filename,
        path: file.signedUrl,
      })),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error(`[contact] Resend failed (${response.status}): ${detail}`);
    throw new Error("Email notification failed");
  }

  if (data.uploadSessionId) {
    await cleanupInquiryUploads(data.uploadSessionId).catch((cleanupError) => {
      console.error("[contact] Attachment cleanup failed after successful email", cleanupError);
    });
  }

  return { ok: true };
}
