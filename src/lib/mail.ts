import nodemailer from "nodemailer";

// SMTP settings come from the environment (see .env.example). Applications and contact messages
// are mailed to MAIL_TO; nothing is stored on the server.
function transport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP ayarları eksik (SMTP_HOST, SMTP_USER, SMTP_PASS)");
  }
  const port = Number(SMTP_PORT) || 465;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type MailField = { label: string; value: string };

export function fieldsTable(fields: MailField[]) {
  const rows = fields
    .filter((f) => f.value && f.value.trim())
    .map(
      (f) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#64748B;vertical-align:top;white-space:nowrap">${escapeHtml(f.label)}</td>` +
        `<td style="padding:6px 0;color:#0F2645;white-space:pre-wrap">${escapeHtml(f.value)}</td></tr>`
    )
    .join("");
  return `<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>`;
}

export async function sendMail(options: {
  subject: string;
  title: string;
  fields: MailField[];
  replyTo?: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}) {
  const to = process.env.MAIL_TO;
  if (!to) throw new Error("MAIL_TO ayarlı değil");

  const html =
    `<div style="font-family:sans-serif;max-width:640px">` +
    `<h2 style="color:#0F2645;margin:0 0 16px">${escapeHtml(options.title)}</h2>` +
    fieldsTable(options.fields) +
    `</div>`;
  const text = options.fields
    .filter((f) => f.value && f.value.trim())
    .map((f) => `${f.label}: ${f.value}`)
    .join("\n");

  await transport().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    replyTo: options.replyTo || undefined,
    subject: options.subject,
    html,
    text,
    attachments: options.attachments,
  });
}
