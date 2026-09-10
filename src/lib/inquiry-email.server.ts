import { createClient } from "@supabase/supabase-js";
import { getRequestHeader } from "@tanstack/react-start/server";

const REFERENCE_BUCKET = "inquiry-references";
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"] as const);
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 25 * 1024 * 1024;
const MAX_REFERENCE_FILES = 5;
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


function expectedExtension(contentType: InquiryReferenceFile["contentType"]) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  return "webp";
}

function sanitizeAttachmentFilename(
  filename: string,
  contentType: InquiryReferenceFile["contentType"],
) {
  const extension = expectedExtension(contentType);
  const leaf = filename.replace(/\\/g, "/").split("/").pop() || "reference";
  const stem = leaf
    .replace(/\.[^.]*$/, "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[^a-zA-Z0-9 _().\-]/g, "_")
    .trim()
    .slice(0, 96) || "reference";
  return `${stem}.${extension}`;
}

function readUint32BE(bytes: Uint8Array, offset: number) {
  return (
    bytes[offset] * 0x1000000 +
    bytes[offset + 1] * 0x10000 +
    bytes[offset + 2] * 0x100 +
    bytes[offset + 3]
  );
}

function readUint32LE(bytes: Uint8Array, offset: number) {
  return (
    bytes[offset] +
    bytes[offset + 1] * 0x100 +
    bytes[offset + 2] * 0x10000 +
    bytes[offset + 3] * 0x1000000
  );
}

function assertPngStructure(bytes: Uint8Array) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 33 || !signature.every((value, index) => bytes[index] === value)) {
    throw new Error("Reference image content does not match PNG");
  }

  let offset = 8;
  let sawIhdr = false;
  let sawIend = false;
  while (offset + 12 <= bytes.length) {
    const length = readUint32BE(bytes, offset);
    const typeOffset = offset + 4;
    const dataOffset = offset + 8;
    const end = dataOffset + length + 4; // includes CRC
    if (end > bytes.length) throw new Error("Malformed PNG reference image");

    const type = String.fromCharCode(
      bytes[typeOffset],
      bytes[typeOffset + 1],
      bytes[typeOffset + 2],
      bytes[typeOffset + 3],
    );

    if (!sawIhdr) {
      if (type !== "IHDR" || length !== 13) throw new Error("Malformed PNG reference image");
      sawIhdr = true;
      const width = readUint32BE(bytes, dataOffset);
      const height = readUint32BE(bytes, dataOffset + 4);
      if (width <= 0 || height <= 0 || width > 20000 || height > 20000) {
        throw new Error("PNG reference image dimensions are invalid");
      }
    }

    offset = end;
    if (type === "IEND") {
      if (length !== 0 || offset !== bytes.length) {
        throw new Error("PNG reference image has unexpected trailing data");
      }
      sawIend = true;
      break;
    }
  }

  if (!sawIhdr || !sawIend) throw new Error("Malformed PNG reference image");
}

function assertJpegStructure(bytes: Uint8Array) {
  if (
    bytes.length < 4 ||
    bytes[0] !== 0xff ||
    bytes[1] !== 0xd8 ||
    bytes[bytes.length - 2] !== 0xff ||
    bytes[bytes.length - 1] !== 0xd9
  ) {
    throw new Error("Reference image content does not match JPEG");
  }
}

function assertWebpStructure(bytes: Uint8Array) {
  if (bytes.length < 12) throw new Error("Reference image content does not match WebP");
  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  if (riff !== "RIFF" || webp !== "WEBP") {
    throw new Error("Reference image content does not match WebP");
  }
  const declaredSize = readUint32LE(bytes, 4) + 8;
  if (declaredSize !== bytes.length) {
    throw new Error("WebP reference image has unexpected trailing or truncated data");
  }
}

function assertTrustedImageBytes(
  bytes: Uint8Array,
  contentType: InquiryReferenceFile["contentType"],
) {
  if (contentType === "image/png") {
    assertPngStructure(bytes);
    return;
  }
  if (contentType === "image/jpeg") {
    assertJpegStructure(bytes);
    return;
  }
  assertWebpStructure(bytes);
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
  console.info(`[contact] inquiry email starting: ${data.submissionId}; attachments=${data.referenceImages.length}`);
  enforceTimingAndHoneypot(data.website, data.formStartedAt);
  enforceMemoryRateLimit(requestLog, MAX_REQUESTS_PER_WINDOW);

  if (data.referenceImages.length) {
    if (!data.uploadSessionId) throw new Error("Upload session is required");
    await verifyStoredReferences(data.uploadSessionId, data.referenceImages);
    console.info(`[contact] reference images verified: ${data.submissionId}; count=${data.referenceImages.length}`);
  }

  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not configured");
    throw new Error("Email service is not configured");
  }

  const supabase = getServerSupabase();
  const emailAttachments: Array<{
    filename: string;
    content: string;
    content_type: InquiryReferenceFile["contentType"];
  }> = [];

  for (const file of data.referenceImages) {
    const { data: downloaded, error } = await supabase.storage
      .from(REFERENCE_BUCKET)
      .download(file.storagePath);
    if (error || !downloaded) {
      throw new Error(`Unable to download attachment: ${error?.message || "unknown error"}`);
    }

    const bytes = new Uint8Array(await downloaded.arrayBuffer());
    if (bytes.byteLength !== file.size) {
      throw new Error("Downloaded reference image size mismatch");
    }

    // Do not trust extension/MIME metadata alone. Validate the actual file bytes
    // before passing a customer upload to Resend/Gmail. This adds no image
    // recompression or file-size overhead.
    assertTrustedImageBytes(bytes, file.contentType);

    let binary = "";
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }

    emailAttachments.push({
      filename: sanitizeAttachmentFilename(file.filename, file.contentType),
      content: btoa(binary),
      content_type: file.contentType,
    });
  }

  if (emailAttachments.length) {
    console.info(
      `[contact] reference images downloaded for Resend: ${data.submissionId}; count=${emailAttachments.length}`,
    );
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
    `Reference images: ${emailAttachments.length ? emailAttachments.map((file) => file.filename).join(", ") : "None"}`,
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

  console.info(`[contact] sending inquiry to Resend: ${data.submissionId}`);

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
      attachments: emailAttachments,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error(`[contact] Resend failed (${response.status}): ${detail}`);
    throw new Error("Email notification failed");
  }

  const responseBody = await response.json().catch(() => null);
  const resendId =
    responseBody && typeof responseBody === "object" && "id" in responseBody
      ? String(responseBody.id)
      : "unknown";
  console.info(`[contact] Resend accepted: ${data.submissionId}; id=${resendId}`);

  if (data.uploadSessionId) {
    await cleanupInquiryUploads(data.uploadSessionId).catch((cleanupError) => {
      console.error("[contact] Attachment cleanup failed after successful email", cleanupError);
    });
  }

  return { ok: true };
}
