import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { z } from "zod";
import { ArrowRight, Check, ImagePlus, Loader2, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import {
  cleanupInquiryUploads,
  prepareInquiryUploads,
  sendInquiryEmail,
} from "@/lib/send-inquiry-email.functions";
import { Reveal, RevealLines } from "@/components/site/reveal";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Start a Project — Illegal Caffeine - Designer -" },
      {
        name: "description",
        content:
          "Commission a custom Minecraft build: server spawns, cities, fantasy worlds, terrain or environments. Send the brief and get a reply.",
      },
      { property: "og:title", content: "Start a Project — Illegal Caffeine - Designer -" },
      {
        property: "og:description",
        content: "Commission a custom Minecraft build from Illegal Caffeine - Designer -.",
      },
    ],
  }),
  component: ContactPage,
});

const projectTypes = [
  "Server Spawn / Hub",
  "City / Town",
  "Fantasy Build",
  "Terrain / Environment",
  "Interior",
  "Other",
];

const scales = [
  "Small (under 200 × 200 blocks)",
  "Medium (200 – 600 blocks)",
  "Large (600 – 1200 blocks)",
  "World scale (1200+ blocks)",
  "Not sure yet",
];

const budgets = [
  "Under $250",
  "$250 – $750",
  "$750 – $2,000",
  "$2,000 – $5,000",
  "$5,000+",
  "Not sure yet",
];

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(255),
  discord: z.string().trim().max(120).optional(),
  project_type: z.string().trim().min(1, "Select a project type"),
  build_scale: z.string().trim().max(120).optional(),
  budget_range: z.string().trim().max(120).optional(),
  deadline: z.string().trim().max(120).optional(),
  description: z.string().trim().min(30, "Tell me a bit more — at least 30 characters").max(5000),
  references: z.string().trim().max(2000).optional(),
  extras: z.string().trim().max(2000).optional(),
  agreement: z.literal("on", { message: "Please accept the commission terms" }),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof schema>, string>>;

function ContactPage() {
  const t = useT();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [referenceFileError, setReferenceFileError] = useState<string | null>(null);
  const formStartedAt = useRef(Date.now());

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries());

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setFormError(t("Please fix the highlighted fields."));
      setStatus("idle");
      return;
    }

    const currentReferenceError = validateReferenceFiles(referenceFiles);
    if (referenceFileError || currentReferenceError) {
      setFormError(t(referenceFileError || currentReferenceError || "Invalid reference images."));
      setStatus("idle");
      return;
    }

    setErrors({});
    setFormError(null);
    setStatus("submitting");

    const submissionId = crypto.randomUUID();
    let uploadSessionId: string | undefined;
    const uploadedReferences: Array<{
      filename: string;
      contentType: "image/jpeg" | "image/png" | "image/webp";
      size: number;
      storagePath: string;
    }> = [];

    try {
      if (referenceFiles.length > 0) {
        const preparation = await prepareInquiryUploads({
          data: {
            files: referenceFiles.map((file) => ({
              filename: file.name,
              contentType: file.type as "image/jpeg" | "image/png" | "image/webp",
              size: file.size,
            })),
            website: String(raw["website"] || ""),
            formStartedAt: formStartedAt.current,
          },
        });

        uploadSessionId = preparation.uploadSessionId;

        for (let index = 0; index < preparation.files.length; index += 1) {
          const slot = preparation.files[index];
          const file = referenceFiles[index];
          if (!slot || !file) throw new Error("Reference image preparation mismatch");

          const { error: uploadError } = await supabase.storage
            .from(preparation.bucket)
            .uploadToSignedUrl(slot.storagePath, slot.token, file, {
              contentType: file.type,
              cacheControl: "0",
            });

          if (uploadError) throw uploadError;

          uploadedReferences.push({
            filename: slot.filename,
            contentType: slot.contentType,
            size: slot.size,
            storagePath: slot.storagePath,
          });
        }
      }

      const referenceFilesRecord = JSON.stringify({
        links: parsed.data.references || null,
        images: uploadedReferences.map(({ filename, contentType, size, storagePath }) => ({
          filename,
          contentType,
          size,
          storagePath,
        })),
      });

      const { error } = await supabase.from("commission_inquiries").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        discord: parsed.data.discord || null,
        project_type: parsed.data.project_type,
        build_scale: parsed.data.build_scale || null,
        budget_range: parsed.data.budget_range || null,
        deadline: parsed.data.deadline || null,
        description: parsed.data.description,
        reference_files: referenceFilesRecord,
        extras: parsed.data.extras || null,
        agreement: true,
      });

      if (error) throw error;
    } catch (saveError) {
      console.error(saveError);
      if (uploadSessionId) {
        await cleanupInquiryUploads({ data: { uploadSessionId } }).catch((cleanupError) => {
          console.error("Reference image cleanup failed", cleanupError);
        });
      }
      setStatus("error");
      setFormError(t("The inquiry couldn't be saved. Please try again in a moment."));
      return;
    }

    try {
      await sendInquiryEmail({
        data: {
          submissionId,
          uploadSessionId,
          name: parsed.data.name,
          email: parsed.data.email,
          discord: parsed.data.discord || undefined,
          project_type: parsed.data.project_type,
          build_scale: parsed.data.build_scale || undefined,
          budget_range: parsed.data.budget_range || undefined,
          deadline: parsed.data.deadline || undefined,
          description: parsed.data.description,
          references: parsed.data.references || undefined,
          extras: parsed.data.extras || undefined,
          referenceImages: uploadedReferences,
          website: String(raw["website"] || ""),
          formStartedAt: formStartedAt.current,
        },
      });
    } catch (emailError) {
      console.error(emailError);
      // The inquiry is already stored in Supabase. Keep uploaded reference files
      // when notification delivery fails so the submission can still be recovered.
      setStatus("error");
      setFormError(
        t(
          "Your inquiry was saved, but the email notification could not be sent. Please contact me directly by email or Discord.",
        ),
      );
      return;
    }

    form.reset();
    setReferenceFiles([]);
    setReferenceFileError(null);
    formStartedAt.current = Date.now();
    setStatus("success");
  }

  return (
    <>
      <section className="border-b border-border px-5 pt-32 pb-12 md:px-10 md:pt-48 md:pb-16">
        <div className="mx-auto max-w-[1600px]">
          <p className="label-mono">{t("COMMISSION / INQUIRY")}</p>
          <RevealLines
            immediate
            className="display-xl mt-6"
            lineTextClassName="text-[65px]"
            lines={[t("Start a project")]}
          />
          <p className="body-lg mt-8 max-w-xl">
            {t(
              "Tell me what you want to exist. Briefs with references, scale and a rough deadline get the most useful reply.",
            )}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <Reveal className="space-y-8 border-t border-border pt-6">
              <div>
                <p className="label-mono">{t("Response")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("Every inquiry is read and answered by email or Discord.")}
                </p>
              </div>
              <div>
                <p className="label-mono">{t("Edition")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("Java. Bedrock on request.")}
                </p>
              </div>
              <div>
                <p className="label-mono">{t("Delivery")}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("Schematics or world files handed over.")}
                </p>
              </div>
              <div>
                <p className="label-mono">{t("Direct")}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t("Discord: illcaffeine")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("Email: illegalcaffeine@gmail.com")}
                </p>
              </div>
            </Reveal>
          </div>

          <div className="md:col-span-8">
            {status === "success" ? (
              <div className="border border-border p-8 md:p-14">
                <span className="flex h-11 w-11 items-center justify-center border border-border">
                  <Check className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="display-md mt-6">{t("Brief received.")}</h2>
                <p className="body-lg mt-4 max-w-md">
                  {t(
                    "Your inquiry is stored and will be answered by email. If it's urgent, send the same details over Discord.",
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="label-mono mt-8 inline-flex min-h-12 items-center border border-border-strong px-6 text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  {t("Send another")}
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-8">
                <div
                  className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
                  aria-hidden="true"
                >
                  <label htmlFor="website">Website</label>
                  <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                  <Field label={t("Name")} name="name" error={errors.name} required />
                  <Field
                    label={t("Email")}
                    name="email"
                    type="email"
                    error={errors.email}
                    required
                  />
                  <Field
                    label={t("Discord username")}
                    name="discord"
                    optional
                    error={errors.discord}
                  />
                  <SelectField
                    label={t("Project type")}
                    name="project_type"
                    options={projectTypes.map((o) => ({ value: o, label: t(o) }))}
                    error={errors.project_type}
                    required
                  />
                  <SelectField
                    label={t("Approximate build scale")}
                    name="build_scale"
                    options={scales.map((o) => ({ value: o, label: t(o) }))}
                    error={errors.build_scale}
                  />
                  <SelectField
                    label={t("Budget range")}
                    name="budget_range"
                    options={budgets.map((o) => ({ value: o, label: t(o) }))}
                    error={errors.budget_range}
                  />
                  <Field
                    label={t("Desired deadline")}
                    name="deadline"
                    type="date"
                    error={errors.deadline}
                  />
                </div>

                <div>
                  <FieldLabel label={t("Project description")} name="description" required />
                  <textarea
                    id="description"
                    name="description"
                    rows={7}
                    placeholder={t(
                      "What is it, who is it for, references, style, scale, must-haves…",
                    )}
                    className={cn(
                      "mt-3 w-full resize-y border bg-surface/50 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground",
                      errors.description ? "border-destructive" : "border-border",
                    )}
                  />
                  <FieldError message={errors.description} />
                </div>

                <div>
                  <FieldLabel label={t("Style / references")} name="references" optional />
                  <textarea
                    id="references"
                    name="references"
                    rows={4}
                    placeholder={t("Links, styles or builds you want it to feel like…")}
                    className={cn(
                      "mt-3 w-full resize-y border bg-surface/50 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground",
                      errors.references ? "border-destructive" : "border-border",
                    )}
                  />
                  <FieldError message={errors.references} />

                  <div className="mt-5">
                    <input
                      id="reference_images"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="sr-only"
                      onChange={(event) => {
                        const incoming = Array.from(event.target.files || []);
                        const next = [...referenceFiles, ...incoming];
                        const error = validateReferenceFiles(next);
                        if (error) {
                          setReferenceFileError(error);
                        } else {
                          setReferenceFiles(next);
                          setReferenceFileError(null);
                        }
                        event.currentTarget.value = "";
                      }}
                    />
                    <label
                      htmlFor="reference_images"
                      className="label-mono inline-flex min-h-12 cursor-pointer items-center gap-3 border border-border-strong px-5 text-foreground transition-colors hover:bg-foreground hover:text-background"
                    >
                      <ImagePlus className="h-4 w-4" aria-hidden />
                      {t("Upload reference images")}
                    </label>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      {t("JPG, PNG or WebP · up to 5 images · 10 MB each · 25 MB total")}
                    </p>
                    {referenceFileError && (
                      <p className="label-mono mt-2 text-destructive">{t(referenceFileError)}</p>
                    )}
                    {referenceFiles.length > 0 && (
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {referenceFiles.map((file, index) => (
                          <div
                            key={`${file.name}-${file.size}-${index}`}
                            className="flex min-w-0 items-center gap-3 border border-border px-3 py-3"
                          >
                            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                              {file.name}
                            </span>
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {formatFileSize(file.size)}
                            </span>
                            <button
                              type="button"
                              aria-label={t("Remove image")}
                              onClick={() => {
                                const next = referenceFiles.filter(
                                  (_, fileIndex) => fileIndex !== index,
                                );
                                setReferenceFiles(next);
                                setReferenceFileError(validateReferenceFiles(next));
                              }}
                              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <X className="h-4 w-4" aria-hidden />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <FieldLabel label={t("Extra requests")} name="extras" optional />
                  <textarea
                    id="extras"
                    name="extras"
                    rows={3}
                    placeholder={t(
                      "Anything else — file format, interiors, schematic splits, redstone…",
                    )}
                    className={cn(
                      "mt-3 w-full resize-y border bg-surface/50 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground",
                      errors.extras ? "border-destructive" : "border-border",
                    )}
                  />
                  <FieldError message={errors.extras} />
                </div>

                <CommissionTerms />

                <div>
                  <label
                    htmlFor="agreement"
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <input
                      id="agreement"
                      name="agreement"
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 shrink-0 border border-border-strong bg-surface accent-foreground"
                    />
                    <span>
                      {t("I have read and accept the commission terms above.")}
                      <span className="text-accent"> *</span>
                    </span>
                  </label>
                  <FieldError message={errors.agreement} />
                </div>

                {formError && status !== "submitting" && (
                  <p className="label-mono text-destructive">{formError}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="label-mono inline-flex min-h-13 items-center gap-4 bg-foreground px-8 text-background transition-opacity hover:opacity-85 disabled:opacity-60"
                >
                  {status === "submitting" ? (
                    <>
                      {t("Sending")} <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    </>
                  ) : (
                    <>
                      {t("Send inquiry")} <ArrowRight className="h-4 w-4" aria-hidden />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

const ALLOWED_REFERENCE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_REFERENCE_FILES = 5;
const MAX_REFERENCE_FILE_SIZE = 10 * 1024 * 1024;
const MAX_REFERENCE_TOTAL_SIZE = 25 * 1024 * 1024;

function validateReferenceFiles(files: File[]) {
  if (files.length > MAX_REFERENCE_FILES) return "You can upload up to 5 reference images.";
  if (files.some((file) => !ALLOWED_REFERENCE_TYPES.has(file.type)))
    return "Reference images must be JPG, PNG or WebP.";
  if (files.some((file) => file.size > MAX_REFERENCE_FILE_SIZE))
    return "Each reference image must be 10 MB or smaller.";
  if (files.reduce((sum, file) => sum + file.size, 0) > MAX_REFERENCE_TOTAL_SIZE)
    return "Reference images must be 25 MB or smaller in total.";
  return null;
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function FieldLabel({
  label,
  name,
  required,
  optional,
}: {
  label: string;
  name: string;
  required?: boolean | undefined;
  optional?: boolean | undefined;
}) {
  const t = useT();
  return (
    <label htmlFor={name} className="label-mono block text-foreground">
      {label}
      {required && <span className="text-accent"> *</span>}
      {optional && <span className="text-muted-foreground"> {t("(optional)")}</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string | undefined }) {
  const t = useT();
  if (!message) return null;
  return <p className="label-mono mt-2 text-destructive">{t(message)}</p>;
}

function Field({
  label,
  name,
  type = "text",
  error,
  required,
  optional,
}: {
  label: string;
  name: string;
  type?: string | undefined;
  error?: string | undefined;
  required?: boolean | undefined;
  optional?: boolean | undefined;
}) {
  return (
    <div>
      <FieldLabel label={label} name={name} required={required} optional={optional} />
      <input
        id={name}
        name={name}
        type={type}
        className={cn(
          "mt-3 h-12 w-full border bg-surface/50 px-4 text-sm text-foreground outline-none transition-colors focus:border-foreground",
          error ? "border-destructive" : "border-border",
        )}
      />
      <FieldError message={error} />
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  error,
  required,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  error?: string | undefined;
  required?: boolean | undefined;
}) {
  const t = useT();
  return (
    <div>
      <FieldLabel label={label} name={name} required={required} />
      <select
        id={name}
        name={name}
        defaultValue=""
        className={cn(
          "mt-3 h-12 w-full appearance-none border bg-surface/50 px-4 text-sm text-foreground outline-none transition-colors focus:border-foreground",
          error ? "border-destructive" : "border-border",
        )}
      >
        <option value="">{t("Select…")}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </div>
  );
}

const terms: { title: string; points: string[] }[] = [
  {
    title: "1. Scope & brief",
    points: [
      "The commission starts once the build type, style, approximate scale, deadline and price are agreed in writing.",
      "Additional requests outside the agreed brief are treated as new requests and may affect price and schedule.",
    ],
  },
  {
    title: "2. Schedule",
    points: [
      "Timelines are estimates based on the agreed scale and the current queue.",
      "Delays caused by late feedback, missing references or changes to the brief extend the schedule accordingly and are not refundable.",
    ],
  },
  {
    title: "3. Payment",
    points: [
      "Payments are handled through PayPal or bank transfer. This website does not process payments.",
      "Larger commissions are usually split into a deposit before work begins and a final payment on delivery.",
      "Files are delivered once the agreed payment has cleared.",
    ],
  },
  {
    title: "4. Revisions",
    points: [
      "Reasonable revisions within the agreed brief are included during the build. (Up to two free revisions.)",
      "Full redesigns, style changes or added areas are quoted separately.",
    ],
  },
  {
    title: "5. Cancellation & refunds",
    points: [
      "Either side may cancel before work begins; in that case any deposit is refunded in full.",
      "If the commission is cancelled after work has started, completed work is invoiced and the remaining balance is refunded.",
      "Refunds are not offered for changes of mind after final delivery and approval.",
    ],
  },
  {
    title: "6. Delivery & usage",
    points: [
      "Builds are delivered as schematics or world files, along with render shots where relevant.",
      "You may use the delivered build freely on your own servers and projects.",
      "Reselling or redistributing the build files as a standalone product is not permitted without agreement.",
      "The studio may show the work in its portfolio unless a commission is agreed to be private in advance.",
    ],
  },
];

function CommissionTerms() {
  const t = useT();
  return (
    <div className="border border-border p-6 md:p-8">
      <p className="label-mono text-foreground">{t("COMMISSION TERMS")}</p>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {t(
          "A short, plain-language agreement so both sides know what to expect. Details specific to your project are confirmed directly in conversation before work begins.",
        )}
      </p>
      <div className="mt-8 space-y-6">
        {terms.map((section) => (
          <div key={section.title} className="border-t border-border pt-5">
            <h3 className="label-mono text-foreground">{t(section.title)}</h3>
            <ul className="mt-3 space-y-2">
              {section.points.map((point) => (
                <li
                  key={point}
                  className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                >
                  <span className="mt-2 h-px w-3 shrink-0 bg-border-strong" />
                  <span>{t(point)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
