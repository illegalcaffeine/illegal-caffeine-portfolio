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
};

function clean(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not provided";
}

export async function deliverInquiryEmail(data: InquiryEmailPayload) {
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
}
