import nodemailer from 'nodemailer'

let transporter = null

export async function sendProjectReviewEmail(config, data) {
  const mail = config.mail

  if (!mail?.host || !mail?.auth?.user || !mail?.auth?.pass || !mail?.from?.address || !config.contact?.email) {
    const error = new Error('Mail configuration is incomplete.')
    error.status = 500
    throw error
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: mail.secure,
      auth: mail.auth,
    })
  }

  await transporter.sendMail({
    from: formatAddress(mail.from.name, mail.from.address),
    to: config.contact.email,
    replyTo: formatAddress(data.name, data.email),
    subject: 'New quote by website',
    text: renderProjectReviewText(data),
    html: renderProjectReviewHtml(data),
  })
}

function formatAddress(name, address) {
  return name ? `"${String(name).replaceAll('"', '\\"')}" <${address}>` : address
}

function renderProjectReviewText(data) {
  return [
    'New quote by website',
    '',
    `Reply directly to this email to contact ${data.name}.`,
    '',
    'Name:',
    data.name,
    '',
    'Contact email:',
    data.email,
    '',
    'Current project or company link:',
    data.projectLink || 'Not provided',
    '',
    'Project type:',
    data.projectType,
    '',
    'Scope:',
    data.scope,
    '',
    'Briefing:',
    data.briefing,
    '',
    'Source URL:',
    data.sourceUrl,
    '',
    'Submitted at:',
    data.submittedAt,
  ].join('\n')
}

function renderProjectReviewHtml(data) {
  const projectLink = data.projectLink
    ? `<a href="${escapeAttribute(data.projectLink)}" style="color:#0369a1;text-decoration:underline;">${escapeHtml(data.projectLink)}</a>`
    : '<span style="color:#64748b;">Not provided</span>'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New quote by website</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;color:#111827;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #dfe4ea;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="padding:28px 30px;background:#0b0f1a;color:#ffffff;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:#4cc9f0;">Website quote request</p>
              <h1 style="margin:0;font-size:26px;line-height:1.2;font-weight:700;">New quote by website</h1>
              <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#cbd5e1;">Reply directly to this email to contact ${escapeHtml(data.name)}.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 30px;">
              ${emailField('Name', data.name)}
              ${emailField('Contact email', `<a href="mailto:${escapeAttribute(data.email)}" style="color:#0369a1;text-decoration:underline;">${escapeHtml(data.email)}</a>`, true)}
              ${emailField('Current project or company link', projectLink, true)}
              ${emailField('Project type', data.projectType)}
              ${emailField('Scope', data.scope)}
              <div style="padding:4px 0 22px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b;">Briefing</p>
                <div style="font-size:16px;line-height:1.65;color:#111827;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 18px;">${escapeHtml(data.briefing).replaceAll('\n', '<br>')}</div>
              </div>
              <div style="padding:18px 0 0;border-top:1px solid #e5e7eb;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b;">Source URL</p>
                <p style="margin:0 0 14px;font-size:14px;line-height:1.5;">
                  <a href="${escapeAttribute(data.sourceUrl)}" style="color:#0369a1;text-decoration:underline;">${escapeHtml(data.sourceUrl)}</a>
                </p>
                <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">Submitted at ${escapeHtml(data.submittedAt)}</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function emailField(label, value, isHtml = false) {
  return `<div style="padding:0 0 18px;">
  <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b;">${escapeHtml(label)}</p>
  <p style="margin:0;font-size:16px;line-height:1.5;color:#111827;">${isHtml ? value : escapeHtml(value)}</p>
</div>`
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#096;')
}
